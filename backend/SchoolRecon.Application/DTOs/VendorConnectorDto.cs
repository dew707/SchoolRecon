namespace SchoolRecon.Application.DTOs;

public class VendorConnectorDto
{
    public string VendorConnectorId { get; set; } = string.Empty;
    public string VendorId { get; set; } = string.Empty;
    public string ConnectorName { get; set; } = string.Empty;
    public string LoginUrl { get; set; } = string.Empty;
    public string ConnectorType { get; set; } = "Browser Automation";
    public int DefaultTimeoutSeconds { get; set; } = 30;
    public int MaxRetryCount { get; set; } = 2;
    public bool IsActive { get; set; } = true;
    public int RowVersion { get; set; } = 1;
}