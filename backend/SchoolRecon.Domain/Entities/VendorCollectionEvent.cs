using System;

namespace SchoolRecon.Domain.Entities;

public class VendorCollectionEvent
{
    public string VendorCollectionEventId { get; set; } = string.Empty;
    public string VendorCollectionJobId { get; set; } = string.Empty;
    public int SequenceNo { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string Stage { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTimeOffset OccurredAt { get; set; } = DateTimeOffset.UtcNow;
    public bool IsError { get; set; } = false;
}