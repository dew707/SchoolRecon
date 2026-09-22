using System;

namespace SchoolRecon.Domain.Entities;

public class VendorReportDefinition
{
    public string VendorReportDefinitionId { get; set; } = string.Empty;
    public string VendorId { get; set; } = string.Empty;
    public string VendorConnectorId { get; set; } = string.Empty;
    public string ReportCode { get; set; } = string.Empty;
    public string ReportName { get; set; } = string.Empty;
    public string DateFormat { get; set; } = "DD/MM/YYYY";
    public string ExpectedFileType { get; set; } = "XLSX";
    public string ExpectedFilenamePattern { get; set; } = string.Empty;
    public int DownloadTimeoutSeconds { get; set; } = 30;
    public long MinimumFileSizeBytes { get; set; } = 0;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}