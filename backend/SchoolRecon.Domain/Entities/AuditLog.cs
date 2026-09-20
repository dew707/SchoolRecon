using System;

namespace SchoolRecon.Domain.Entities;

public class AuditLog
{
    public string AuditLogId { get; set; } = string.Empty;
    public string Entity { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string ChangedBy { get; set; } = string.Empty;
    public DateTimeOffset ChangedAt { get; set; } = DateTimeOffset.UtcNow;
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
}