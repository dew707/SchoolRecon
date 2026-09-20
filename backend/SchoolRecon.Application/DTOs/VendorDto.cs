using System.Collections.Generic;

namespace SchoolRecon.Application.DTOs;

public class VendorDto
{
    public string Id { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? PortalUrl { get; set; }
    public string LoginUrl { get; set; } = string.Empty;
    public string ConnectorType { get; set; } = string.Empty;
    public string AuthType { get; set; } = "Username + Password";
    public int SchoolsCount { get; set; }
    public string LastCollection { get; set; } = "18 Sep 2026 01:04";
    public double SuccessRate { get; set; } = 99.2;
    public string Health { get; set; } = "Healthy";
    public bool IsActive { get; set; } = true;
    public int RowVersion { get; set; } = 1;

    public CredentialReferenceDto CredentialReference { get; set; } = new();
    public VendorConnectorDto? Connector { get; set; }
    public ReportDefinitionDto? ReportDefinition { get; set; }
    public List<NavigationStepDto> NavigationSteps { get; set; } = new();
    public List<SchoolMappingDto> SchoolMappings { get; set; } = new();
}

public class CredentialReferenceDto
{
    public string SecretId { get; set; } = string.Empty;
    public string SecretProvider { get; set; } = "DevelopmentSecretProvider";
    public string VaultPath { get; set; } = string.Empty;
    public string UsernameIdentifier { get; set; } = "demo-operator";
    public bool CredentialConfigured { get; set; } = true;
    public string LastRotated { get; set; } = "18 Sep 2026 00:00:00 UTC";
}