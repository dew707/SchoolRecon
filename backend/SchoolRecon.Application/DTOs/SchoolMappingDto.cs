namespace SchoolRecon.Application.DTOs;

public class SchoolMappingDto
{
    public string MappingId { get; set; } = string.Empty;
    public string InternalSchoolId { get; set; } = string.Empty;
    public string InternalSchoolName { get; set; } = string.Empty;
    public string VendorSchoolCode { get; set; } = string.Empty;
    public string VendorSchoolLabel { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}