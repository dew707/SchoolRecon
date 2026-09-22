namespace SchoolRecon.Domain.Entities;

public class VendorReportParameter
{
    public string VendorReportParameterId { get; set; } = string.Empty;
    public string VendorReportDefinitionId { get; set; } = string.Empty;
    public string ParameterCode { get; set; } = string.Empty;
    public string ParameterType { get; set; } = string.Empty;
    public string? SelectorStrategy { get; set; }
    public string? SelectorValue { get; set; }
    public string ValueSource { get; set; } = string.Empty;
    public string? StaticValue { get; set; }
    public int SequenceNo { get; set; }
    public bool IsRequired { get; set; } = true;
}