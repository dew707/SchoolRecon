using System;

namespace SchoolRecon.Domain.Entities;

public class Vendor
{
    public string VendorId { get; set; } = string.Empty;
    public string VendorCode { get; set; } = string.Empty;
    public string VendorName { get; set; } = string.Empty;
    public string? PortalUrl { get; set; }
    public string ConnectorType { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = "SYSTEM";
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public string UpdatedBy { get; set; } = "SYSTEM";
    public int RowVersion { get; set; } = 1;
}