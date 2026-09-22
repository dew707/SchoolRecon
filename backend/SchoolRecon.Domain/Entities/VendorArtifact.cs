using System;

namespace SchoolRecon.Domain.Entities;

public class VendorArtifact
{
    public string VendorArtifactId { get; set; } = string.Empty;
    public string VendorCollectionJobId { get; set; } = string.Empty;
    public string VendorId { get; set; } = string.Empty;
    public string SchoolId { get; set; } = string.Empty;
    public string BusinessDate { get; set; } = string.Empty;
    public string OriginalFilename { get; set; } = string.Empty;
    public string StoredFilename { get; set; } = string.Empty;
    public string StorageLocation { get; set; } = string.Empty;
    public string ContentType { get; set; } = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    public long FileSizeBytes { get; set; }
    public int RowCount { get; set; }
    public decimal TotalAmount { get; set; }
    public string Sha256 { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}