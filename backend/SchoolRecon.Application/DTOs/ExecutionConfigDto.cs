using System.Collections.Generic;

namespace SchoolRecon.Application.DTOs;

public class ExecutionConfigDto
{
    public ExecutionVendorDto Vendor { get; set; } = new();
    public ExecutionCredentialDto Credential { get; set; } = new();
    public ExecutionConnectorDto Connector { get; set; } = new();
    public List<NavigationStepDto> NavigationSteps { get; set; } = new();
    public ReportDefinitionDto ReportDefinition { get; set; } = new();
    public List<ReportParameterDto> ReportParameters { get; set; } = new();
    public List<SchoolMappingDto> SchoolMappings { get; set; } = new();
}

public class ExecutionVendorDto
{
    public string VendorId { get; set; } = string.Empty;
    public string VendorCode { get; set; } = string.Empty;
    public string VendorName { get; set; } = string.Empty;
    public string PortalUrl { get; set; } = string.Empty;
}

public class ExecutionCredentialDto
{
    public string AuthenticationType { get; set; } = "Username + Password";
    public string SecretProvider { get; set; } = "DevelopmentSecretProvider";
    public string SecretReference { get; set; } = string.Empty;
    public string UsernameIdentifier { get; set; } = "demo-operator";
}

public class ExecutionConnectorDto
{
    public string ConnectorId { get; set; } = string.Empty;
    public string ConnectorName { get; set; } = string.Empty;
    public string LoginUrl { get; set; } = string.Empty;
    public int DefaultTimeoutSeconds { get; set; } = 30;
    public int MaxRetryCount { get; set; } = 2;
}