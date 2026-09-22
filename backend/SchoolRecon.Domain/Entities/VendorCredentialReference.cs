using System;

namespace SchoolRecon.Domain.Entities;

public class VendorCredentialReference
{
    public string VendorCredentialReferenceId { get; set; } = string.Empty;
    public string VendorId { get; set; } = string.Empty;
    public string Environment { get; set; } = "DEMO";
    public string SecretProvider { get; set; } = "DevelopmentSecretProvider";
    public string SecretReference { get; set; } = string.Empty;
    public string AuthenticationType { get; set; } = "Username + Password";
    public bool IsConfigured { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public int RowVersion { get; set; } = 1;
}
