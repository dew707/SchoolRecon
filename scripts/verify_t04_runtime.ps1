param([int]$ApiPort = 5099)

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$apiProject = Join-Path $repo 'backend\SchoolRecon.Api'
$procedureFile = Join-Path $repo 'database\stored-procedures\sp_NavigationStep_Procedures.sql'
$baseUrl = "http://127.0.0.1:$ApiPort/api"
$apiProcess = $null
$original = $null
$vendorId = $null
$connectorId = $null

function Assert-True([bool]$condition, [string]$message) {
    if (-not $condition) { throw "FAIL: $message" }
    Write-Output "PASS: $message"
}

function Start-TestApi {
    $container = docker inspect schoolrecon-sql | ConvertFrom-Json
    $passwordEntry = $container[0].Config.Env | Where-Object { $_ -like 'MSSQL_SA_PASSWORD=*' } | Select-Object -First 1
    if (-not $passwordEntry) { throw 'SQL Server container credential environment is unavailable.' }
    $password = $passwordEntry.Substring('MSSQL_SA_PASSWORD='.Length)
    $env:ConnectionStrings__DefaultConnection = "Server=localhost,1433;Database=SchoolRecon;User Id=sa;Password=$password;TrustServerCertificate=True;MultipleActiveResultSets=true;"
    $env:ASPNETCORE_URLS = "http://127.0.0.1:$ApiPort"
    $process = Start-Process -FilePath 'dotnet' -ArgumentList @('run','--project',$apiProject,'--no-build','--no-launch-profile','--urls',"http://127.0.0.1:$ApiPort") -WorkingDirectory $repo -WindowStyle Hidden -PassThru
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        Start-Sleep -Milliseconds 500
        try { Invoke-RestMethod "$baseUrl/vendors" | Out-Null; return $process } catch { }
    }
    throw 'API did not become ready.'
}

function Stop-TestApi {
    param($process)
    if ($process -and -not $process.HasExited) { Stop-Process -Id $process.Id -Force }
}

try {
    docker cp $procedureFile 'schoolrecon-sql:/tmp/t04-navigation.sql' | Out-Null
    docker exec schoolrecon-sql bash -lc '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -d SchoolRecon -C -b -i /tmp/t04-navigation.sql' | Out-Null
    $deployExit = $LASTEXITCODE
    docker exec -u 0 schoolrecon-sql rm -f /tmp/t04-navigation.sql | Out-Null
    Assert-True ($deployExit -eq 0) 'navigation stored procedures deployed to Docker SQL Server'

    $apiProcess = Start-TestApi
    $vendors = Invoke-RestMethod "$baseUrl/vendors"
    foreach ($vendor in $vendors) {
        try {
            $connector = Invoke-RestMethod "$baseUrl/vendors/$($vendor.id)/connector"
            $vendorId = $vendor.id
            $connectorId = $connector.vendorConnectorId
            break
        } catch { }
    }
    Assert-True ([bool]$vendorId) 'vendor with persisted connector exists'

    $original = Invoke-RestMethod "$baseUrl/vendors/$vendorId/navigation-steps"
    Assert-True ($original.Count -gt 0) 'existing navigation workflow loads'

    $workflow = @(
        @{ id=''; sequence=1; stepCode='T04_OPEN'; action='NAVIGATE'; selectorStrategy='css'; selector='/login'; inputSource=$null; staticValue=$null; description='Open login'; timeoutMs=15000; retryCount=1; isRequired=$true; isActive=$true },
        @{ id=''; sequence=2; stepCode='T04_USER'; action='FILL'; selectorStrategy='data-testid'; selector='username'; inputSource='CREDENTIAL_USERNAME'; staticValue=$null; description='Enter username'; timeoutMs=5000; retryCount=1; isRequired=$true; isActive=$true },
        @{ id=''; sequence=3; stepCode='T04_SCHOOL'; action='SELECT'; selectorStrategy='id'; selector='school'; inputSource='{{vendorSchoolCode}}'; staticValue=$null; description='Select school'; timeoutMs=5000; retryCount=1; isRequired=$true; isActive=$true }
    )
    $saved = Invoke-RestMethod "$baseUrl/vendors/$vendorId/navigation-steps" -Method Put -ContentType 'application/json' -Body ($workflow | ConvertTo-Json -Depth 5)
    Assert-True ($saved.Count -eq 3) 'add and complete workflow save persists'

    $saved[1].description = 'Edited username step'
    $duplicate = $saved[1].PSObject.Copy(); $duplicate.id = ''; $duplicate.stepCode = 'T04_USER_COPY'; $duplicate.sequence = 3; $duplicate.isActive = $false
    $saved[2].sequence = 4
    $reordered = @($saved[0], $saved[2], $duplicate, $saved[1])
    for ($i=0; $i -lt $reordered.Count; $i++) { $reordered[$i].sequence = $i + 1 }
    $saved = Invoke-RestMethod "$baseUrl/vendors/$vendorId/navigation-steps" -Method Put -ContentType 'application/json' -Body ($reordered | ConvertTo-Json -Depth 5)
    Assert-True (($saved.sequence -join ',') -eq '1,2,3,4') 'duplicate and reorder persist contiguous sequence'
    Assert-True ($saved[2].isActive -eq $false) 'enable/disable persists'
    Assert-True ($saved[3].description -eq 'Edited username step') 'edit persists'

    $afterDelete = @($saved | Where-Object stepCode -ne 'T04_USER_COPY')
    for ($i=0; $i -lt $afterDelete.Count; $i++) { $afterDelete[$i].sequence = $i + 1 }
    $saved = Invoke-RestMethod "$baseUrl/vendors/$vendorId/navigation-steps" -Method Put -ContentType 'application/json' -Body ($afterDelete | ConvertTo-Json -Depth 5)
    Assert-True ($saved.Count -eq 3) 'delete persists'

    $invalidCases = @(
        @(@{ id=''; sequence=1; stepCode='BAD'; action='BAD'; selectorStrategy='css'; selector='x'; description='bad'; timeoutMs=1000; retryCount=0; isRequired=$true; isActive=$true }),
        @(@{ id=''; sequence=1; stepCode='DUP'; action='CLICK'; selectorStrategy='css'; selector='x'; description='one'; timeoutMs=1000; retryCount=0; isRequired=$true; isActive=$true }, @{ id=''; sequence=2; stepCode='DUP'; action='CLICK'; selectorStrategy='css'; selector='y'; description='two'; timeoutMs=1000; retryCount=0; isRequired=$true; isActive=$true }),
        @(@{ id=''; sequence=1; stepCode='VAR'; action='SET_DATE'; selectorStrategy='css'; selector='x'; inputSource='{{invalid}}'; description='bad variable'; timeoutMs=1000; retryCount=0; isRequired=$true; isActive=$true })
    )
    foreach ($case in $invalidCases) {
        $rejected = $false
        try { Invoke-RestMethod "$baseUrl/vendors/$vendorId/navigation-steps" -Method Put -ContentType 'application/json' -Body ($case | ConvertTo-Json -Depth 5) | Out-Null } catch { $rejected = $_.Exception.Response.StatusCode.value__ -eq 400 }
        Assert-True $rejected 'invalid navigation payload rejected with HTTP 400'
    }

    $beforeAtomic = (Invoke-RestMethod "$baseUrl/vendors/$vendorId/navigation-steps" | ConvertTo-Json -Depth 5 -Compress)
    $atomicPayload = @($saved | ForEach-Object { $_.PSObject.Copy() }); $atomicPayload[-1].description = $null
    try { Invoke-RestMethod "$baseUrl/vendors/$vendorId/navigation-steps" -Method Put -ContentType 'application/json' -Body ($atomicPayload | ConvertTo-Json -Depth 5) | Out-Null } catch { }
    $afterAtomic = (Invoke-RestMethod "$baseUrl/vendors/$vendorId/navigation-steps" | ConvertTo-Json -Depth 5 -Compress)
    Assert-True ($beforeAtomic -eq $afterAtomic) 'failed database batch rolls back atomically'

    Stop-TestApi $apiProcess; $apiProcess = Start-TestApi
    $afterRestart = Invoke-RestMethod "$baseUrl/vendors/$vendorId/navigation-steps"
    Assert-True ($afterRestart[0].stepCode -eq 'T04_OPEN') 'API restart retains workflow'

    $query = "SET NOCOUNT ON; SELECT COUNT(*) FROM VendorNavigationStep WHERE VendorConnectorId='$connectorId';"
    $sqlCount = docker exec schoolrecon-sql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P ((docker inspect schoolrecon-sql | ConvertFrom-Json)[0].Config.Env | Where-Object { $_ -like 'MSSQL_SA_PASSWORD=*' } | ForEach-Object { $_.Substring('MSSQL_SA_PASSWORD='.Length) }) -d SchoolRecon -C -h -1 -W -Q $query
    Assert-True (($sqlCount | Select-Object -First 1).Trim() -eq '3') 'independent SQL query confirms persisted records'
    $serialized = $afterRestart | ConvertTo-Json -Depth 5
    Assert-True ($serialized -notmatch '(?i)password\s*[:=]\s*[^\s\"]+') 'API payload contains no resolved secret values'
}
finally {
    if ($vendorId -and $null -ne $original) {
        try { Invoke-RestMethod "$baseUrl/vendors/$vendorId/navigation-steps" -Method Put -ContentType 'application/json' -Body ($original | ConvertTo-Json -Depth 6) | Out-Null } catch { }
    }
    Stop-TestApi $apiProcess
    Remove-Item Env:ConnectionStrings__DefaultConnection -ErrorAction SilentlyContinue
    Remove-Item Env:ASPNETCORE_URLS -ErrorAction SilentlyContinue
}
