using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using SchoolRecon.Api.Middleware;
using SchoolRecon.Application.Interfaces;
using SchoolRecon.Application.Services;
using SchoolRecon.Infrastructure.Audit;
using SchoolRecon.Infrastructure.Data;
using SchoolRecon.Infrastructure.Repositories;
using SchoolRecon.Infrastructure.Secrets;

var builder = WebApplication.CreateBuilder(args);

// Add Services & DI
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "SchoolRecon Vendor Configuration & Collection API",
        Version = "v1",
        Description = "ASP.NET Core REST API for SchoolRecon Vendor Management, Crawler Steps, and Collection Telemetry using SQL Server Stored Procedures via Dapper."
    });
});

// Database & Connection String Builder (Environment-driven with fallback to appsettings)
var sqlHost = Environment.GetEnvironmentVariable("SQLSERVER_HOST") ?? builder.Configuration["SQLSERVER_HOST"];
var sqlPort = Environment.GetEnvironmentVariable("SQLSERVER_PORT") ?? builder.Configuration["SQLSERVER_PORT"] ?? "1433";
var sqlDatabase = Environment.GetEnvironmentVariable("SQLSERVER_DATABASE") ?? builder.Configuration["SQLSERVER_DATABASE"] ?? "SchoolRecon";
var sqlUser = Environment.GetEnvironmentVariable("SQLSERVER_USER") ?? builder.Configuration["SQLSERVER_USER"] ?? "sa";
var sqlPassword = Environment.GetEnvironmentVariable("SQLSERVER_PASSWORD") ?? builder.Configuration["SQLSERVER_PASSWORD"] ?? "";
var sqlEncrypt = Environment.GetEnvironmentVariable("SQLSERVER_ENCRYPT") ?? builder.Configuration["SQLSERVER_ENCRYPT"] ?? "False";
var sqlTrustCert = Environment.GetEnvironmentVariable("SQLSERVER_TRUST_SERVER_CERTIFICATE") ?? builder.Configuration["SQLSERVER_TRUST_SERVER_CERTIFICATE"] ?? "True";

string connectionString;
if (!string.IsNullOrWhiteSpace(sqlHost))
{
    var csBuilder = new SqlConnectionStringBuilder
    {
        DataSource = $"{sqlHost},{sqlPort}",
        InitialCatalog = sqlDatabase,
        UserID = sqlUser,
        Password = sqlPassword,
        Encrypt = bool.TryParse(sqlEncrypt, out var enc) && enc,
        TrustServerCertificate = !bool.TryParse(sqlTrustCert, out var tc) || tc,
        MultipleActiveResultSets = true
    };
    connectionString = csBuilder.ConnectionString;
}
else
{
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? "Server=localhost,1433;Database=SchoolRecon;User Id=sa;Password=;TrustServerCertificate=True;MultipleActiveResultSets=true;";
}

builder.Services.AddSingleton<IDbConnectionFactory>(_ => new SqlConnectionFactory(connectionString));

// Repositories
builder.Services.AddScoped<IVendorRepository, VendorRepository>();
builder.Services.AddScoped<IConnectorRepository, ConnectorRepository>();
builder.Services.AddScoped<INavigationStepRepository, NavigationStepRepository>();
builder.Services.AddScoped<IReportDefinitionRepository, ReportDefinitionRepository>();
builder.Services.AddScoped<ISchoolMappingRepository, SchoolMappingRepository>();
builder.Services.AddScoped<ICollectionJobRepository, CollectionJobRepository>();
builder.Services.AddScoped<IArtifactRepository, ArtifactRepository>();

// Infrastructure
builder.Services.AddSingleton<ISecretProvider, DevelopmentSecretProvider>();
builder.Services.AddScoped<IAuditService, SqlAuditService>();

// Application Services
builder.Services.AddScoped<IVendorService, VendorService>();
builder.Services.AddScoped<IConfigurationService, ConfigurationService>();
builder.Services.AddScoped<ICollectionJobService, CollectionJobService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "SchoolRecon API v1");
        c.RoutePrefix = "swagger";
    });
}

// Health & Readiness Endpoints
app.MapGet("/health", () => Results.Ok(new
{
    status = "HEALTHY",
    service = "SchoolRecon.Api",
    timestamp = DateTimeOffset.UtcNow
}));

app.MapGet("/health/ready", async (IDbConnectionFactory factory) =>
{
    try
    {
        using var conn = factory.CreateConnection();
        if (conn.State != System.Data.ConnectionState.Open)
        {
            if (conn is System.Data.Common.DbConnection dbConn)
            {
                await dbConn.OpenAsync();
            }
            else
            {
                conn.Open();
            }
        }
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT 1";
        await ((System.Data.Common.DbCommand)cmd).ExecuteScalarAsync();
        return Results.Ok(new
        {
            status = "READY",
            database = "HEALTHY",
            provider = "Microsoft SQL Server",
            timestamp = DateTimeOffset.UtcNow
        });
    }
    catch (Exception ex)
    {
        return Results.Json(new
        {
            status = "NOT READY",
            database = "UNHEALTHY",
            error = ex.Message,
            timestamp = DateTimeOffset.UtcNow
        }, statusCode: 503);
    }
});

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();
