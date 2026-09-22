using System.Collections.Generic;

namespace SchoolRecon.Application.DTOs;

public class ReportDefinitionDto
{
    public string ReportDefinitionId { get; set; } = string.Empty;
    public string ReportCode { get; set; } = "DAILY_COLLECTION_REPORT";
    public string ReportName { get; set; } = "Daily Collection Report";
    public string SchoolParameter { get; set; } = "schoolCode";
    public string DateParameter { get; set; } = "date";
    public string DateFormat { get; set; } = "DD/MM/YYYY";
    public string ExpectedFileType { get; set; } = "XLSX";
    public string FilenamePattern { get; set; } = "TransBingo_Collection_*.xlsx";
    public int DownloadTimeoutSec { get; set; } = 30;
    public int MinExpectedFileSizeKb { get; set; } = 40;
    public List<ReportParameterDto> Parameters { get; set; } = new();
}

public class ReportParameterDto
{
    public string ParameterId { get; set; } = string.Empty;
    public string ParameterCode { get; set; } = string.Empty;
    public string ParameterType { get; set; } = "STRING";
    public string? SelectorStrategy { get; set; }
    public string? SelectorValue { get; set; }
    public string ValueSource { get; set; } = "STATIC";
    public string? StaticValue { get; set; }
    public int SequenceNo { get; set; }
    public bool IsRequired { get; set; } = true;
}