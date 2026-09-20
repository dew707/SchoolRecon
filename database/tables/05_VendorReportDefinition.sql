-- Table: VendorReportDefinition
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'VendorReportDefinition')
BEGIN
    CREATE TABLE VendorReportDefinition (
        VendorReportDefinitionId VARCHAR(64) NOT NULL PRIMARY KEY,
        VendorId VARCHAR(64) NOT NULL,
        VendorConnectorId VARCHAR(64) NOT NULL,
        ReportCode VARCHAR(50) NOT NULL,
        ReportName NVARCHAR(150) NOT NULL,
        DateFormat VARCHAR(50) NOT NULL,
        ExpectedFileType VARCHAR(20) NOT NULL,
        ExpectedFilenamePattern NVARCHAR(255) NOT NULL,
        DownloadTimeoutSeconds INT NOT NULL CONSTRAINT DF_RepDef_Timeout DEFAULT 30,
        MinimumFileSizeBytes BIGINT NOT NULL CONSTRAINT DF_RepDef_MinSize DEFAULT 0,
        IsActive BIT NOT NULL CONSTRAINT DF_RepDef_IsActive DEFAULT 1,
        CreatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_RepDef_CreatedAt DEFAULT SYSDATETIMEOFFSET(),
        UpdatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_RepDef_UpdatedAt DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT FK_RepDef_Vendor FOREIGN KEY (VendorId) REFERENCES Vendor(VendorId),
        CONSTRAINT FK_RepDef_Connector FOREIGN KEY (VendorConnectorId) REFERENCES VendorConnector(VendorConnectorId)
    );

    CREATE INDEX IX_RepDef_VendorId ON VendorReportDefinition(VendorId);
    CREATE INDEX IX_RepDef_ConnectorId ON VendorReportDefinition(VendorConnectorId);
END;
GO
