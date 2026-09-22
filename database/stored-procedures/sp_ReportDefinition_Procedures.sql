-- Stored Procedures: Vendor Report Definition & Parameters
CREATE OR ALTER PROCEDURE sp_VendorReportDefinition_Get
    @VendorId VARCHAR(64)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        VendorReportDefinitionId,
        VendorId,
        VendorConnectorId,
        ReportCode,
        ReportName,
        DateFormat,
        ExpectedFileType,
        ExpectedFilenamePattern,
        DownloadTimeoutSeconds,
        MinimumFileSizeBytes,
        IsActive,
        CreatedAt,
        UpdatedAt
    FROM VendorReportDefinition
    WHERE VendorId = @VendorId;
END;
GO

CREATE OR ALTER PROCEDURE sp_VendorReportDefinition_Save
    @VendorReportDefinitionId VARCHAR(64),
    @VendorId VARCHAR(64),
    @VendorConnectorId VARCHAR(64),
    @ReportCode VARCHAR(50),
    @ReportName NVARCHAR(150),
    @DateFormat VARCHAR(50),
    @ExpectedFileType VARCHAR(20),
    @ExpectedFilenamePattern NVARCHAR(255),
    @DownloadTimeoutSeconds INT,
    @MinimumFileSizeBytes BIGINT,
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM VendorReportDefinition WHERE VendorReportDefinitionId = @VendorReportDefinitionId)
    BEGIN
        UPDATE VendorReportDefinition
        SET ReportCode = @ReportCode,
            ReportName = @ReportName,
            DateFormat = @DateFormat,
            ExpectedFileType = @ExpectedFileType,
            ExpectedFilenamePattern = @ExpectedFilenamePattern,
            DownloadTimeoutSeconds = @DownloadTimeoutSeconds,
            MinimumFileSizeBytes = @MinimumFileSizeBytes,
            IsActive = @IsActive,
            UpdatedAt = SYSDATETIMEOFFSET()
        WHERE VendorReportDefinitionId = @VendorReportDefinitionId;
    END
    ELSE
    BEGIN
        INSERT INTO VendorReportDefinition (
            VendorReportDefinitionId, VendorId, VendorConnectorId, ReportCode,
            ReportName, DateFormat, ExpectedFileType, ExpectedFilenamePattern,
            DownloadTimeoutSeconds, MinimumFileSizeBytes, IsActive
        )
        VALUES (
            @VendorReportDefinitionId, @VendorId, @VendorConnectorId, @ReportCode,
            @ReportName, @DateFormat, @ExpectedFileType, @ExpectedFilenamePattern,
            @DownloadTimeoutSeconds, @MinimumFileSizeBytes, @IsActive
        );
    END
    SELECT * FROM VendorReportDefinition WHERE VendorReportDefinitionId = @VendorReportDefinitionId;
END;
GO

CREATE OR ALTER PROCEDURE sp_VendorReportParameter_Get
    @VendorReportDefinitionId VARCHAR(64)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        VendorReportParameterId,
        VendorReportDefinitionId,
        ParameterCode,
        ParameterType,
        SelectorStrategy,
        SelectorValue,
        ValueSource,
        StaticValue,
        SequenceNo,
        IsRequired
    FROM VendorReportParameter
    WHERE VendorReportDefinitionId = @VendorReportDefinitionId
    ORDER BY SequenceNo ASC;
END;
GO

CREATE OR ALTER PROCEDURE sp_VendorReportParameter_Save
    @VendorReportParameterId VARCHAR(64),
    @VendorReportDefinitionId VARCHAR(64),
    @ParameterCode VARCHAR(50),
    @ParameterType VARCHAR(50),
    @SelectorStrategy VARCHAR(50) = NULL,
    @SelectorValue NVARCHAR(500) = NULL,
    @ValueSource VARCHAR(50),
    @StaticValue NVARCHAR(500) = NULL,
    @SequenceNo INT,
    @IsRequired BIT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM VendorReportParameter WHERE VendorReportParameterId = @VendorReportParameterId)
    BEGIN
        UPDATE VendorReportParameter
        SET ParameterCode = @ParameterCode,
            ParameterType = @ParameterType,
            SelectorStrategy = @SelectorStrategy,
            SelectorValue = @SelectorValue,
            ValueSource = @ValueSource,
            StaticValue = @StaticValue,
            SequenceNo = @SequenceNo,
            IsRequired = @IsRequired
        WHERE VendorReportParameterId = @VendorReportParameterId;
    END
    ELSE
    BEGIN
        INSERT INTO VendorReportParameter (
            VendorReportParameterId, VendorReportDefinitionId, ParameterCode,
            ParameterType, SelectorStrategy, SelectorValue, ValueSource,
            StaticValue, SequenceNo, IsRequired
        )
        VALUES (
            @VendorReportParameterId, @VendorReportDefinitionId, @ParameterCode,
            @ParameterType, @SelectorStrategy, @SelectorValue, @ValueSource,
            @StaticValue, @SequenceNo, @IsRequired
        );
    END
END;
GO
