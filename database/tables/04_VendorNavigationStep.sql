-- Table: VendorNavigationStep
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'VendorNavigationStep')
BEGIN
    CREATE TABLE VendorNavigationStep (
        VendorNavigationStepId VARCHAR(64) NOT NULL PRIMARY KEY,
        VendorConnectorId VARCHAR(64) NOT NULL,
        SequenceNo INT NOT NULL,
        StepCode VARCHAR(50) NOT NULL,
        ActionType VARCHAR(50) NOT NULL,
        SelectorStrategy VARCHAR(50) NOT NULL,
        SelectorValue NVARCHAR(500) NOT NULL,
        InputSource VARCHAR(50) NULL,
        StaticValue NVARCHAR(500) NULL,
        Description NVARCHAR(500) NOT NULL,
        TimeoutSeconds INT NOT NULL CONSTRAINT DF_NavStep_Timeout DEFAULT 15,
        RetryCount INT NOT NULL CONSTRAINT DF_NavStep_Retry DEFAULT 1,
        IsRequired BIT NOT NULL CONSTRAINT DF_NavStep_IsRequired DEFAULT 1,
        IsActive BIT NOT NULL CONSTRAINT DF_NavStep_IsActive DEFAULT 1,
        CreatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_NavStep_CreatedAt DEFAULT SYSDATETIMEOFFSET(),
        UpdatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_NavStep_UpdatedAt DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT FK_NavStep_Connector FOREIGN KEY (VendorConnectorId) REFERENCES VendorConnector(VendorConnectorId) ON DELETE CASCADE,
        CONSTRAINT UQ_NavStep_Connector_Sequence UNIQUE (VendorConnectorId, SequenceNo)
    );

    CREATE INDEX IX_NavStep_ConnectorId ON VendorNavigationStep(VendorConnectorId);
    CREATE INDEX IX_NavStep_SequenceNo ON VendorNavigationStep(SequenceNo);
END;
GO
