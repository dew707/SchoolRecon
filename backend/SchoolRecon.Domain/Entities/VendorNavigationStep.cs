using System;

namespace SchoolRecon.Domain.Entities;

public class VendorNavigationStep
{
    public string VendorNavigationStepId { get; set; } = string.Empty;
    public string VendorConnectorId { get; set; } = string.Empty;
    public int SequenceNo { get; set; }
    public string StepCode { get; set; } = string.Empty;
    public string ActionType { get; set; } = string.Empty;
    public string SelectorStrategy { get; set; } = string.Empty;
    public string SelectorValue { get; set; } = string.Empty;
    public string? InputSource { get; set; }
    public string? StaticValue { get; set; }
    public string Description { get; set; } = string.Empty;
    public int TimeoutSeconds { get; set; } = 15;
    public int RetryCount { get; set; } = 1;
    public bool IsRequired { get; set; } = true;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}