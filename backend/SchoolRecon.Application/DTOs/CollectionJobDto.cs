using System.Collections.Generic;

namespace SchoolRecon.Application.DTOs;

public class CreateCollectionJobRequest
{
    public string SchoolCode { get; set; } = "UTTARA_MDL";
    public string SchoolName { get; set; } = "Uttara Model High School";
    public string BusinessDate { get; set; } = "18-Sep-2026";
    public string Scenario { get; set; } = "normal";
    public string TestType { get; set; } = "full";
}

public class CollectionJobDto
{
    public string Id { get; set; } = string.Empty;
    public string JobReference { get; set; } = string.Empty;
    public string VendorId { get; set; } = string.Empty;
    public string VendorName { get; set; } = string.Empty;
    public string SchoolId { get; set; } = string.Empty;
    public string SchoolName { get; set; } = string.Empty;
    public string BusinessDate { get; set; } = string.Empty;
    public string Status { get; set; } = "STARTING";
    public string StartedAt { get; set; } = string.Empty;
    public string? CompletedAt { get; set; }
    public int DurationSeconds { get; set; }
    public int CurrentStepIndex { get; set; }
    public int TotalSteps { get; set; }
    public string CurrentAction { get; set; } = string.Empty;
    public string CurrentUrl { get; set; } = string.Empty;
    public string BrowserStatus { get; set; } = "LAUNCHING";
    public string? FailureReason { get; set; }
    public List<CollectionEventDto> Events { get; set; } = new();
    public ArtifactDto? Artifact { get; set; }
}

public class CollectionEventDto
{
    public string Timestamp { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool? IsSuccess { get; set; }
    public bool? IsError { get; set; }
}

public class ArtifactDto
{
    public string Id { get; set; } = string.Empty;
    public string VendorId { get; set; } = string.Empty;
    public string SchoolId { get; set; } = string.Empty;
    public string BusinessDate { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = "XLSX";
    public string FileSize { get; set; } = string.Empty;
    public int RowCount { get; set; }
    public decimal TotalAmount { get; set; }
    public string Sha256 { get; set; } = string.Empty;
    public string CollectedAt { get; set; } = string.Empty;
    public string Status { get; set; } = "Valid";
}