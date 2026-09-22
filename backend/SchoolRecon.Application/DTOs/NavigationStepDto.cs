namespace SchoolRecon.Application.DTOs;

public class NavigationStepDto
{
    public string Id { get; set; } = string.Empty;
    public int Sequence { get; set; }
    public string StepCode { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string SelectorStrategy { get; set; } = string.Empty;
    public string Selector { get; set; } = string.Empty;
    public string? Value { get; set; }
    public string Description { get; set; } = string.Empty;
    public int TimeoutMs { get; set; } = 15000;
    public int RetryCount { get; set; } = 1;
    public bool IsRequired { get; set; } = true;
    public bool IsActive { get; set; } = true;
}