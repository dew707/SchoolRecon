-- Table: VendorReportParameter
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'VendorReportParameter')
BEGIN
    CREATE TABLE VendorReportParameter (
        VendorReportParameterId VARCHAR(64) NOT NULL PRIMARY KEY,
        VendorReportDefinitionId VARCHAR(64) NOT NULL,
        ParameterCode VARCHAR(50) NOT NULL,
        ParameterType VARCHAR(50) NOT NULL,
        SelectorStrategy VARCHAR(50) NULL,
        SelectorValue NVARCHAR(500) NULL,
        ValueSource VARCHAR(50) NOT NULL,
        StaticValue NVARCHAR(500) NULL,
        SequenceNo INT NOT NULL,
        IsRequired BIT NOT NULL CONSTRAINT DF_RepParam_IsRequired DEFAULT 1,
        CONSTRAINT FK_RepParam_ReportDef FOREIGN KEY (VendorReportDefinitionId) REFERENCES VendorReportDefinition(VendorReportDefinitionId) ON DELETE CASCADE
    );

    CREATE INDEX IX_RepParam_ReportDefId ON VendorReportParameter(VendorReportDefinitionId);
    CREATE INDEX IX_RepParam_SequenceNo ON VendorReportParameter(SequenceNo);
END;
GO
