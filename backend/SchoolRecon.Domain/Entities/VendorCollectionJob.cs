using System;

namespace SchoolRecon.Domain.Entities;

public class VendorCollectionJob
{
    public string VendorCollectionJobId { get; set; } = string.Empty;
    public string JobReference { get; set; } = string.Empty;
    public string VendorId { get; set; } = string.Empty;
    public string SchoolId { get; set; } = string.Empty;
    public string BusinessDate { get; set; } = string.Empty;
    public string Status { get; set; } = "STARTING";
    public DateTimeOffset StartedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? CompletedAt { get; set; }
    public int AttemptCount { get; set; } = 1;
    public string? ArtifactId { get; set; }
    public string? FailureCode { get; set; }
    public string? FailureMessage { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public string CreatedBy { get; set; } = "SYSTEM";
}