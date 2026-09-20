using System;

namespace SchoolRecon.Domain.Entities;

public class VendorSchoolMapping
{
    public string VendorSchoolMappingId { get; set; } = string.Empty;
    public string VendorId { get; set; } = string.Empty;
    public string SchoolId { get; set; } = string.Empty;
    public string VendorSchoolCode { get; set; } = string.Empty;
    public string VendorSchoolName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}