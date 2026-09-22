-- ============================================================================
-- SchoolRecon — Complete Database Deployment Script (SQL Server 2022)
-- Milestone 2: Tables, Stored Procedures, and Seed Data
-- ============================================================================

IF DB_ID('SchoolRecon') IS NULL
BEGIN
    CREATE DATABASE [SchoolRecon];
END;
GO

USE [SchoolRecon];
GO

-- ============================================================================
-- 1. RELATIONAL TABLES
-- ============================================================================

-- SECTION: tables/01_Vendor.sql
-- Table: Vendor
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Vendor')
BEGIN
    CREATE TABLE Vendor (
        VendorId VARCHAR(64) NOT NULL PRIMARY KEY,
        VendorCode VARCHAR(50) NOT NULL,
        VendorName NVARCHAR(150) NOT NULL,
        PortalUrl NVARCHAR(500) NULL,
        ConnectorType VARCHAR(50) NOT NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_Vendor_IsActive DEFAULT 1,
        CreatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_Vendor_CreatedAt DEFAULT SYSDATETIMEOFFSET(),
        CreatedBy NVARCHAR(100) NOT NULL CONSTRAINT DF_Vendor_CreatedBy DEFAULT 'SYSTEM',
        UpdatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_Vendor_UpdatedAt DEFAULT SYSDATETIMEOFFSET(),
        UpdatedBy NVARCHAR(100) NOT NULL CONSTRAINT DF_Vendor_UpdatedBy DEFAULT 'SYSTEM',
        RowVersion INT NOT NULL CONSTRAINT DF_Vendor_RowVersion DEFAULT 1
    );

    CREATE UNIQUE INDEX UQ_Vendor_VendorCode ON Vendor(VendorCode);
    CREATE INDEX IX_Vendor_IsActive ON Vendor(IsActive);
END;
GO

GO

-- SECTION: tables/02_VendorCredentialReference.sql
-- Table: VendorCredentialReference
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'VendorCredentialReference')
BEGIN
    CREATE TABLE VendorCredentialReference (
        VendorCredentialReferenceId VARCHAR(64) NOT NULL PRIMARY KEY,
        VendorId VARCHAR(64) NOT NULL,
        Environment VARCHAR(50) NOT NULL,
        SecretProvider VARCHAR(100) NOT NULL,
        SecretReference NVARCHAR(255) NOT NULL,
        AuthenticationType VARCHAR(50) NOT NULL,
        IsConfigured BIT NOT NULL CONSTRAINT DF_CredRef_IsConfigured DEFAULT 1,
        CreatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_CredRef_CreatedAt DEFAULT SYSDATETIMEOFFSET(),
        UpdatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_CredRef_UpdatedAt DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT FK_CredRef_Vendor FOREIGN KEY (VendorId) REFERENCES Vendor(VendorId) ON DELETE CASCADE
    );

    CREATE INDEX IX_CredRef_VendorId ON VendorCredentialReference(VendorId);
    CREATE INDEX IX_CredRef_Environment ON VendorCredentialReference(Environment);
END;
GO

GO

-- SECTION: tables/03_VendorConnector.sql
-- Table: VendorConnector
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'VendorConnector')
BEGIN
    CREATE TABLE VendorConnector (
        VendorConnectorId VARCHAR(64) NOT NULL PRIMARY KEY,
        VendorId VARCHAR(64) NOT NULL,
        ConnectorName NVARCHAR(150) NOT NULL,
        LoginUrl NVARCHAR(500) NOT NULL,
        ConnectorType VARCHAR(50) NOT NULL,
        DefaultTimeoutSeconds INT NOT NULL CONSTRAINT DF_Conn_Timeout DEFAULT 30,
        MaxRetryCount INT NOT NULL CONSTRAINT DF_Conn_Retry DEFAULT 2,
        IsActive BIT NOT NULL CONSTRAINT DF_Conn_IsActive DEFAULT 1,
        CreatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_Conn_CreatedAt DEFAULT SYSDATETIMEOFFSET(),
        UpdatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_Conn_UpdatedAt DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT FK_Conn_Vendor FOREIGN KEY (VendorId) REFERENCES Vendor(VendorId) ON DELETE CASCADE
    );

    CREATE INDEX IX_Conn_VendorId ON VendorConnector(VendorId);
    CREATE INDEX IX_Conn_IsActive ON VendorConnector(IsActive);
END;
GO

GO

-- SECTION: tables/04_VendorNavigationStep.sql
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

GO

-- SECTION: tables/05_VendorReportDefinition.sql
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

GO

-- SECTION: tables/06_VendorReportParameter.sql
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

GO

-- SECTION: tables/07_School.sql
-- Table: School
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'School')
BEGIN
    CREATE TABLE School (
        SchoolId VARCHAR(64) NOT NULL PRIMARY KEY,
        SchoolCode VARCHAR(50) NOT NULL,
        SchoolName NVARCHAR(200) NOT NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_School_IsActive DEFAULT 1,
        CreatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_School_CreatedAt DEFAULT SYSDATETIMEOFFSET(),
        UpdatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_School_UpdatedAt DEFAULT SYSDATETIMEOFFSET()
    );

    CREATE UNIQUE INDEX UQ_School_SchoolCode ON School(SchoolCode);
    CREATE INDEX IX_School_IsActive ON School(IsActive);
END;
GO

GO

-- SECTION: tables/08_VendorSchoolMapping.sql
-- Table: VendorSchoolMapping
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'VendorSchoolMapping')
BEGIN
    CREATE TABLE VendorSchoolMapping (
        VendorSchoolMappingId VARCHAR(64) NOT NULL PRIMARY KEY,
        VendorId VARCHAR(64) NOT NULL,
        SchoolId VARCHAR(64) NOT NULL,
        VendorSchoolCode VARCHAR(50) NOT NULL,
        VendorSchoolName NVARCHAR(200) NOT NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_SchMap_IsActive DEFAULT 1,
        CreatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_SchMap_CreatedAt DEFAULT SYSDATETIMEOFFSET(),
        UpdatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_SchMap_UpdatedAt DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT FK_SchMap_Vendor FOREIGN KEY (VendorId) REFERENCES Vendor(VendorId),
        CONSTRAINT FK_SchMap_School FOREIGN KEY (SchoolId) REFERENCES School(SchoolId),
        CONSTRAINT UQ_SchMap_Vendor_School UNIQUE (VendorId, SchoolId)
    );

    CREATE INDEX IX_SchMap_VendorId ON VendorSchoolMapping(VendorId);
    CREATE INDEX IX_SchMap_SchoolId ON VendorSchoolMapping(SchoolId);
END;
GO

GO

-- SECTION: tables/09_VendorCollectionJob.sql
-- Table: VendorCollectionJob
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'VendorCollectionJob')
BEGIN
    CREATE TABLE VendorCollectionJob (
        VendorCollectionJobId VARCHAR(64) NOT NULL PRIMARY KEY,
        JobReference VARCHAR(100) NOT NULL,
        VendorId VARCHAR(64) NOT NULL,
        SchoolId VARCHAR(64) NOT NULL,
        BusinessDate VARCHAR(50) NOT NULL,
        Status VARCHAR(50) NOT NULL,
        StartedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_ColJob_StartedAt DEFAULT SYSDATETIMEOFFSET(),
        CompletedAt DATETIMEOFFSET NULL,
        AttemptCount INT NOT NULL CONSTRAINT DF_ColJob_AttemptCount DEFAULT 1,
        ArtifactId VARCHAR(64) NULL,
        FailureCode VARCHAR(100) NULL,
        FailureMessage NVARCHAR(1000) NULL,
        CreatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_ColJob_CreatedAt DEFAULT SYSDATETIMEOFFSET(),
        CreatedBy NVARCHAR(100) NOT NULL CONSTRAINT DF_ColJob_CreatedBy DEFAULT 'SYSTEM',
        CONSTRAINT FK_ColJob_Vendor FOREIGN KEY (VendorId) REFERENCES Vendor(VendorId),
        CONSTRAINT FK_ColJob_School FOREIGN KEY (SchoolId) REFERENCES School(SchoolId),
        CONSTRAINT UQ_ColJob_Reference UNIQUE (JobReference)
    );

    CREATE INDEX IX_ColJob_Vendor_School_Date ON VendorCollectionJob(VendorId, SchoolId, BusinessDate);
    CREATE INDEX IX_ColJob_Status ON VendorCollectionJob(Status);
END;
GO

GO

-- SECTION: tables/10_VendorCollectionEvent.sql
-- Table: VendorCollectionEvent
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'VendorCollectionEvent')
BEGIN
    CREATE TABLE VendorCollectionEvent (
        VendorCollectionEventId VARCHAR(64) NOT NULL PRIMARY KEY,
        VendorCollectionJobId VARCHAR(64) NOT NULL,
        SequenceNo INT NOT NULL,
        EventType VARCHAR(50) NOT NULL,
        Stage VARCHAR(50) NOT NULL,
        Message NVARCHAR(1000) NOT NULL,
        OccurredAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_ColEvt_OccurredAt DEFAULT SYSDATETIMEOFFSET(),
        IsError BIT NOT NULL CONSTRAINT DF_ColEvt_IsError DEFAULT 0,
        CONSTRAINT FK_ColEvt_Job FOREIGN KEY (VendorCollectionJobId) REFERENCES VendorCollectionJob(VendorCollectionJobId) ON DELETE CASCADE
    );

    CREATE INDEX IX_ColEvt_JobId ON VendorCollectionEvent(VendorCollectionJobId);
    CREATE INDEX IX_ColEvt_OccurredAt ON VendorCollectionEvent(OccurredAt);
END;
GO

GO

-- SECTION: tables/11_VendorArtifact.sql
-- Table: VendorArtifact
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'VendorArtifact')
BEGIN
    CREATE TABLE VendorArtifact (
        VendorArtifactId VARCHAR(64) NOT NULL PRIMARY KEY,
        VendorCollectionJobId VARCHAR(64) NOT NULL,
        VendorId VARCHAR(64) NOT NULL,
        SchoolId VARCHAR(64) NOT NULL,
        BusinessDate VARCHAR(50) NOT NULL,
        OriginalFilename NVARCHAR(255) NOT NULL,
        StoredFilename NVARCHAR(255) NOT NULL,
        StorageLocation NVARCHAR(500) NOT NULL,
        ContentType VARCHAR(100) NOT NULL,
        FileSizeBytes BIGINT NOT NULL,
        RowCount INT NOT NULL,
        TotalAmount DECIMAL(18, 2) NOT NULL,
        Sha256 VARCHAR(64) NOT NULL,
        CreatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_Artifact_CreatedAt DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT FK_Artifact_Job FOREIGN KEY (VendorCollectionJobId) REFERENCES VendorCollectionJob(VendorCollectionJobId),
        CONSTRAINT FK_Artifact_Vendor FOREIGN KEY (VendorId) REFERENCES Vendor(VendorId),
        CONSTRAINT FK_Artifact_School FOREIGN KEY (SchoolId) REFERENCES School(SchoolId)
    );

    CREATE INDEX IX_Artifact_Sha256 ON VendorArtifact(Sha256);
    CREATE INDEX IX_Artifact_Vendor_School_Date ON VendorArtifact(VendorId, SchoolId, BusinessDate);
END;
GO

GO

-- SECTION: tables/12_AuditLog.sql
-- Table: AuditLog
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditLog')
BEGIN
    CREATE TABLE AuditLog (
        AuditLogId VARCHAR(64) NOT NULL PRIMARY KEY,
        Entity VARCHAR(100) NOT NULL,
        EntityId VARCHAR(64) NOT NULL,
        Action VARCHAR(50) NOT NULL,
        ChangedBy NVARCHAR(100) NOT NULL,
        ChangedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_Audit_ChangedAt DEFAULT SYSDATETIMEOFFSET(),
        OldValues NVARCHAR(MAX) NULL,
        NewValues NVARCHAR(MAX) NULL
    );

    CREATE INDEX IX_AuditLog_Entity ON AuditLog(Entity, EntityId);
    CREATE INDEX IX_AuditLog_ChangedAt ON AuditLog(ChangedAt);
END;
GO

GO

-- ============================================================================
-- 2. STORED PROCEDURES
-- ============================================================================

-- SECTION: stored-procedures/sp_Vendor_Procedures.sql
-- Stored Procedures: Vendor Operations
CREATE OR ALTER PROCEDURE sp_Vendor_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        v.VendorId,
        v.VendorCode,
        v.VendorName,
        v.PortalUrl,
        v.ConnectorType,
        v.IsActive,
        v.CreatedAt,
        v.CreatedBy,
        v.UpdatedAt,
        v.UpdatedBy,
        v.RowVersion,
        (SELECT COUNT(1) FROM VendorSchoolMapping m WHERE m.VendorId = v.VendorId AND m.IsActive = 1) AS SchoolsCount,
        vc.LoginUrl,
        vcr.AuthenticationType AS AuthType,
        vcr.SecretReference,
        vcr.SecretProvider,
        vcr.IsConfigured AS CredentialConfigured
    FROM Vendor v
    LEFT JOIN VendorConnector vc ON v.VendorId = vc.VendorId AND vc.IsActive = 1
    LEFT JOIN VendorCredentialReference vcr ON v.VendorId = vcr.VendorId
    ORDER BY v.VendorName;
END;
GO

CREATE OR ALTER PROCEDURE sp_Vendor_GetById
    @VendorId VARCHAR(64)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        v.VendorId,
        v.VendorCode,
        v.VendorName,
        v.PortalUrl,
        v.ConnectorType,
        v.IsActive,
        v.CreatedAt,
        v.CreatedBy,
        v.UpdatedAt,
        v.UpdatedBy,
        v.RowVersion,
        (SELECT COUNT(1) FROM VendorSchoolMapping m WHERE m.VendorId = v.VendorId AND m.IsActive = 1) AS SchoolsCount,
        vc.LoginUrl,
        vcr.AuthenticationType AS AuthType,
        vcr.SecretReference,
        vcr.SecretProvider,
        vcr.IsConfigured AS CredentialConfigured
    FROM Vendor v
    LEFT JOIN VendorConnector vc ON v.VendorId = vc.VendorId AND vc.IsActive = 1
    LEFT JOIN VendorCredentialReference vcr ON v.VendorId = vcr.VendorId
    WHERE v.VendorId = @VendorId;
END;
GO

CREATE OR ALTER PROCEDURE sp_Vendor_Create
    @VendorId VARCHAR(64),
    @VendorCode VARCHAR(50),
    @VendorName NVARCHAR(150),
    @PortalUrl NVARCHAR(500),
    @ConnectorType VARCHAR(50),
    @CreatedBy NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Vendor (VendorId, VendorCode, VendorName, PortalUrl, ConnectorType, CreatedBy, UpdatedBy, RowVersion)
    VALUES (@VendorId, @VendorCode, @VendorName, @PortalUrl, @ConnectorType, @CreatedBy, @CreatedBy, 1);

    SELECT * FROM Vendor WHERE VendorId = @VendorId;
END;
GO

CREATE OR ALTER PROCEDURE sp_Vendor_Update
    @VendorId VARCHAR(64),
    @VendorName NVARCHAR(150),
    @PortalUrl NVARCHAR(500),
    @ConnectorType VARCHAR(50),
    @IsActive BIT,
    @UpdatedBy NVARCHAR(100),
    @ExpectedRowVersion INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CurrentRowVersion INT;
    SELECT @CurrentRowVersion = RowVersion FROM Vendor WHERE VendorId = @VendorId;

    IF @CurrentRowVersion IS NULL
    BEGIN
        RAISERROR('Vendor not found', 16, 1);
        RETURN;
    END

    IF @CurrentRowVersion != @ExpectedRowVersion
    BEGIN
        RAISERROR('Concurrency conflict: Configuration has been modified by another operator.', 16, 2);
        RETURN;
    END

    UPDATE Vendor
    SET VendorName = @VendorName,
        PortalUrl = @PortalUrl,
        ConnectorType = @ConnectorType,
        IsActive = @IsActive,
        UpdatedBy = @UpdatedBy,
        UpdatedAt = SYSDATETIMEOFFSET(),
        RowVersion = RowVersion + 1
    WHERE VendorId = @VendorId AND RowVersion = @ExpectedRowVersion;

    SELECT * FROM Vendor WHERE VendorId = @VendorId;
END;
GO

GO

-- SECTION: stored-procedures/sp_Connector_Procedures.sql
-- Stored Procedures: Vendor Connector
CREATE OR ALTER PROCEDURE sp_VendorConnector_GetByVendor
    @VendorId VARCHAR(64)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        VendorConnectorId,
        VendorId,
        ConnectorName,
        LoginUrl,
        ConnectorType,
        DefaultTimeoutSeconds,
        MaxRetryCount,
        IsActive,
        CreatedAt,
        UpdatedAt
    FROM VendorConnector
    WHERE VendorId = @VendorId;
END;
GO

CREATE OR ALTER PROCEDURE sp_VendorConnector_Save
    @VendorConnectorId VARCHAR(64),
    @VendorId VARCHAR(64),
    @ConnectorName NVARCHAR(150),
    @LoginUrl NVARCHAR(500),
    @ConnectorType VARCHAR(50),
    @DefaultTimeoutSeconds INT,
    @MaxRetryCount INT,
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM VendorConnector WHERE VendorConnectorId = @VendorConnectorId)
    BEGIN
        UPDATE VendorConnector
        SET ConnectorName = @ConnectorName,
            LoginUrl = @LoginUrl,
            ConnectorType = @ConnectorType,
            DefaultTimeoutSeconds = @DefaultTimeoutSeconds,
            MaxRetryCount = @MaxRetryCount,
            IsActive = @IsActive,
            UpdatedAt = SYSDATETIMEOFFSET()
        WHERE VendorConnectorId = @VendorConnectorId;
    END
    ELSE
    BEGIN
        INSERT INTO VendorConnector (
            VendorConnectorId, VendorId, ConnectorName, LoginUrl, 
            ConnectorType, DefaultTimeoutSeconds, MaxRetryCount, IsActive
        )
        VALUES (
            @VendorConnectorId, @VendorId, @ConnectorName, @LoginUrl, 
            @ConnectorType, @DefaultTimeoutSeconds, @MaxRetryCount, @IsActive
        );
    END

    SELECT * FROM VendorConnector WHERE VendorConnectorId = @VendorConnectorId;
END;
GO

GO

-- SECTION: stored-procedures/sp_NavigationStep_Procedures.sql
-- Stored Procedures: Vendor Navigation Steps
CREATE OR ALTER PROCEDURE sp_VendorNavigationStep_GetByConnector
    @VendorConnectorId VARCHAR(64)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        VendorNavigationStepId,
        VendorConnectorId,
        SequenceNo,
        StepCode,
        ActionType,
        SelectorStrategy,
        SelectorValue,
        InputSource,
        StaticValue,
        Description,
        TimeoutSeconds,
        RetryCount,
        IsRequired,
        IsActive,
        CreatedAt,
        UpdatedAt
    FROM VendorNavigationStep
    WHERE VendorConnectorId = @VendorConnectorId
    ORDER BY SequenceNo ASC;
END;
GO

CREATE OR ALTER PROCEDURE sp_VendorNavigationStep_Save
    @VendorNavigationStepId VARCHAR(64),
    @VendorConnectorId VARCHAR(64),
    @SequenceNo INT,
    @StepCode VARCHAR(50),
    @ActionType VARCHAR(50),
    @SelectorStrategy VARCHAR(50),
    @SelectorValue NVARCHAR(500),
    @InputSource VARCHAR(50) = NULL,
    @StaticValue NVARCHAR(500) = NULL,
    @Description NVARCHAR(500),
    @TimeoutSeconds INT,
    @RetryCount INT,
    @IsRequired BIT,
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM VendorNavigationStep WHERE VendorNavigationStepId = @VendorNavigationStepId)
    BEGIN
        UPDATE VendorNavigationStep
        SET VendorConnectorId = @VendorConnectorId,
            SequenceNo = @SequenceNo,
            StepCode = @StepCode,
            ActionType = @ActionType,
            SelectorStrategy = @SelectorStrategy,
            SelectorValue = @SelectorValue,
            InputSource = @InputSource,
            StaticValue = @StaticValue,
            Description = @Description,
            TimeoutSeconds = @TimeoutSeconds,
            RetryCount = @RetryCount,
            IsRequired = @IsRequired,
            IsActive = @IsActive,
            UpdatedAt = SYSDATETIMEOFFSET()
        WHERE VendorNavigationStepId = @VendorNavigationStepId;
    END
    ELSE
    BEGIN
        INSERT INTO VendorNavigationStep (
            VendorNavigationStepId, VendorConnectorId, SequenceNo, StepCode,
            ActionType, SelectorStrategy, SelectorValue, InputSource, StaticValue,
            Description, TimeoutSeconds, RetryCount, IsRequired, IsActive
        )
        VALUES (
            @VendorNavigationStepId, @VendorConnectorId, @SequenceNo, @StepCode,
            @ActionType, @SelectorStrategy, @SelectorValue, @InputSource, @StaticValue,
            @Description, @TimeoutSeconds, @RetryCount, @IsRequired, @IsActive
        );
    END
END;
GO

CREATE OR ALTER PROCEDURE sp_VendorNavigationStep_Delete
    @VendorNavigationStepId VARCHAR(64)
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM VendorNavigationStep WHERE VendorNavigationStepId = @VendorNavigationStepId;
END;
GO

GO

-- SECTION: stored-procedures/sp_ReportDefinition_Procedures.sql
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

GO

-- SECTION: stored-procedures/sp_SchoolMapping_Procedures.sql
-- Stored Procedures: Vendor School Mapping
CREATE OR ALTER PROCEDURE sp_VendorSchoolMapping_Get
    @VendorId VARCHAR(64)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        m.VendorSchoolMappingId,
        m.VendorId,
        m.SchoolId,
        s.SchoolCode AS InternalSchoolCode,
        s.SchoolName AS InternalSchoolName,
        m.VendorSchoolCode,
        m.VendorSchoolName,
        m.IsActive,
        m.CreatedAt,
        m.UpdatedAt
    FROM VendorSchoolMapping m
    INNER JOIN School s ON m.SchoolId = s.SchoolId
    WHERE m.VendorId = @VendorId
    ORDER BY s.SchoolName ASC;
END;
GO

CREATE OR ALTER PROCEDURE sp_VendorSchoolMapping_Save
    @VendorSchoolMappingId VARCHAR(64),
    @VendorId VARCHAR(64),
    @SchoolId VARCHAR(64),
    @VendorSchoolCode VARCHAR(50),
    @VendorSchoolName NVARCHAR(200),
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM VendorSchoolMapping WHERE VendorSchoolMappingId = @VendorSchoolMappingId)
    BEGIN
        UPDATE VendorSchoolMapping
        SET VendorSchoolCode = @VendorSchoolCode,
            VendorSchoolName = @VendorSchoolName,
            IsActive = @IsActive,
            UpdatedAt = SYSDATETIMEOFFSET()
        WHERE VendorSchoolMappingId = @VendorSchoolMappingId;
    END
    ELSE
    BEGIN
        INSERT INTO VendorSchoolMapping (
            VendorSchoolMappingId, VendorId, SchoolId, VendorSchoolCode, VendorSchoolName, IsActive
        )
        VALUES (
            @VendorSchoolMappingId, @VendorId, @SchoolId, @VendorSchoolCode, @VendorSchoolName, @IsActive
        );
    END
END;
GO

GO

-- SECTION: stored-procedures/sp_CollectionJob_Procedures.sql
-- Stored Procedures: Vendor Collection Job & Telemetry Events
CREATE OR ALTER PROCEDURE sp_VendorCollectionJob_Create
    @VendorCollectionJobId VARCHAR(64),
    @JobReference VARCHAR(100),
    @VendorId VARCHAR(64),
    @SchoolId VARCHAR(64),
    @BusinessDate VARCHAR(50),
    @CreatedBy NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO VendorCollectionJob (
        VendorCollectionJobId, JobReference, VendorId, SchoolId,
        BusinessDate, Status, StartedAt, CreatedBy
    )
    VALUES (
        @VendorCollectionJobId, @JobReference, @VendorId, @SchoolId,
        @BusinessDate, 'STARTING', SYSDATETIMEOFFSET(), @CreatedBy
    );

    SELECT * FROM VendorCollectionJob WHERE VendorCollectionJobId = @VendorCollectionJobId;
END;
GO

CREATE OR ALTER PROCEDURE sp_VendorCollectionJob_UpdateStatus
    @VendorCollectionJobId VARCHAR(64),
    @Status VARCHAR(50),
    @ArtifactId VARCHAR(64) = NULL,
    @FailureCode VARCHAR(100) = NULL,
    @FailureMessage NVARCHAR(1000) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE VendorCollectionJob
    SET Status = @Status,
        ArtifactId = COALESCE(@ArtifactId, ArtifactId),
        FailureCode = COALESCE(@FailureCode, FailureCode),
        FailureMessage = COALESCE(@FailureMessage, FailureMessage),
        CompletedAt = CASE WHEN @Status IN ('COMPLETED', 'FAILED') THEN SYSDATETIMEOFFSET() ELSE CompletedAt END
    WHERE VendorCollectionJobId = @VendorCollectionJobId;

    SELECT * FROM VendorCollectionJob WHERE VendorCollectionJobId = @VendorCollectionJobId;
END;
GO

CREATE OR ALTER PROCEDURE sp_VendorCollectionJob_GetById
    @VendorCollectionJobId VARCHAR(64)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        j.*,
        v.VendorName,
        s.SchoolName
    FROM VendorCollectionJob j
    INNER JOIN Vendor v ON j.VendorId = v.VendorId
    INNER JOIN School s ON j.SchoolId = s.SchoolId
    WHERE j.VendorCollectionJobId = @VendorCollectionJobId;
END;
GO

CREATE OR ALTER PROCEDURE sp_VendorCollectionEvent_Insert
    @VendorCollectionEventId VARCHAR(64),
    @VendorCollectionJobId VARCHAR(64),
    @SequenceNo INT,
    @EventType VARCHAR(50),
    @Stage VARCHAR(50),
    @Message NVARCHAR(1000),
    @IsError BIT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO VendorCollectionEvent (
        VendorCollectionEventId, VendorCollectionJobId, SequenceNo,
        EventType, Stage, Message, IsError, OccurredAt
    )
    VALUES (
        @VendorCollectionEventId, @VendorCollectionJobId, @SequenceNo,
        @EventType, @Stage, @Message, @IsError, SYSDATETIMEOFFSET()
    );
END;
GO

CREATE OR ALTER PROCEDURE sp_VendorCollectionEvent_GetByJob
    @VendorCollectionJobId VARCHAR(64)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM VendorCollectionEvent
    WHERE VendorCollectionJobId = @VendorCollectionJobId
    ORDER BY SequenceNo ASC;
END;
GO

GO

-- SECTION: stored-procedures/sp_Artifact_Procedures.sql
-- Stored Procedures: Vendor Artifact Operations
CREATE OR ALTER PROCEDURE sp_VendorArtifact_Insert
    @VendorArtifactId VARCHAR(64),
    @VendorCollectionJobId VARCHAR(64),
    @VendorId VARCHAR(64),
    @SchoolId VARCHAR(64),
    @BusinessDate VARCHAR(50),
    @OriginalFilename NVARCHAR(255),
    @StoredFilename NVARCHAR(255),
    @StorageLocation NVARCHAR(500),
    @ContentType VARCHAR(100),
    @FileSizeBytes BIGINT,
    @RowCount INT,
    @TotalAmount DECIMAL(18, 2),
    @Sha256 VARCHAR(64)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO VendorArtifact (
        VendorArtifactId, VendorCollectionJobId, VendorId, SchoolId,
        BusinessDate, OriginalFilename, StoredFilename, StorageLocation,
        ContentType, FileSizeBytes, RowCount, TotalAmount, Sha256
    )
    VALUES (
        @VendorArtifactId, @VendorCollectionJobId, @VendorId, @SchoolId,
        @BusinessDate, @OriginalFilename, @StoredFilename, @StorageLocation,
        @ContentType, @FileSizeBytes, @RowCount, @TotalAmount, @Sha256
    );

    SELECT * FROM VendorArtifact WHERE VendorArtifactId = @VendorArtifactId;
END;
GO

CREATE OR ALTER PROCEDURE sp_VendorArtifact_GetById
    @VendorArtifactId VARCHAR(64)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        a.*,
        v.VendorName,
        s.SchoolName
    FROM VendorArtifact a
    INNER JOIN Vendor v ON a.VendorId = v.VendorId
    INNER JOIN School s ON a.SchoolId = s.SchoolId
    WHERE a.VendorArtifactId = @VendorArtifactId;
END;
GO

CREATE OR ALTER PROCEDURE sp_AuditLog_Insert
    @AuditLogId VARCHAR(64),
    @Entity VARCHAR(100),
    @EntityId VARCHAR(64),
    @Action VARCHAR(50),
    @ChangedBy NVARCHAR(100),
    @OldValues NVARCHAR(MAX) = NULL,
    @NewValues NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO AuditLog (AuditLogId, Entity, EntityId, Action, ChangedBy, OldValues, NewValues, ChangedAt)
    VALUES (@AuditLogId, @Entity, @EntityId, @Action, @ChangedBy, @OldValues, @NewValues, SYSDATETIMEOFFSET());
END;
GO

GO

-- ============================================================================
-- 3. SEED DATA
-- ============================================================================

-- SECTION: seed/01_Seed_TransBingo_Demo.sql
-- Seed Data: TransBingo Demo Configuration (Migrated from mockData.ts)
-- ZERO plaintext passwords in SQL. Only secret references stored.

-- 1. School Master Data
IF NOT EXISTS (SELECT 1 FROM School WHERE SchoolId = 'SCH-004')
BEGIN
    INSERT INTO School (SchoolId, SchoolCode, SchoolName, IsActive)
    VALUES ('SCH-004', 'UTTARA_MDL', 'Uttara Model High School', 1);
END;

IF NOT EXISTS (SELECT 1 FROM School WHERE SchoolId = 'SCH-001')
BEGIN
    INSERT INTO School (SchoolId, SchoolCode, SchoolName, IsActive)
    VALUES ('SCH-001', 'ABC_INT', 'ABC School', 1);
END;

IF NOT EXISTS (SELECT 1 FROM School WHERE SchoolId = 'SCH-009')
BEGIN
    INSERT INTO School (SchoolId, SchoolCode, SchoolName, IsActive)
    VALUES ('SCH-009', 'DHAKA_MDL', 'Dhaka Model School', 1);
END;

-- 2. Vendor Record
IF NOT EXISTS (SELECT 1 FROM Vendor WHERE VendorId = 'VEND-01')
BEGIN
    INSERT INTO Vendor (VendorId, VendorCode, VendorName, PortalUrl, ConnectorType, IsActive, CreatedBy, UpdatedBy, RowVersion)
    VALUES ('VEND-01', 'TRANSBINGO', 'TransBingo Demo', 'http://localhost:8085/demo-vendor', 'Browser Automation', 1, 'MIGRATION', 'MIGRATION', 1);
END;

-- 3. Vendor Credential Reference (Reference only - no secret/password)
IF NOT EXISTS (SELECT 1 FROM VendorCredentialReference WHERE VendorCredentialReferenceId = 'sec-transbingo-01')
BEGIN
    INSERT INTO VendorCredentialReference (
        VendorCredentialReferenceId, VendorId, Environment, SecretProvider,
        SecretReference, AuthenticationType, IsConfigured
    )
    VALUES (
        'sec-transbingo-01', 'VEND-01', 'DEMO', 'DevelopmentSecretProvider',
        'vault://transbingo/demo/operator', 'Username + Password', 1
    );
END;

-- 4. Vendor Connector
IF NOT EXISTS (SELECT 1 FROM VendorConnector WHERE VendorConnectorId = 'CONN-01')
BEGIN
    INSERT INTO VendorConnector (
        VendorConnectorId, VendorId, ConnectorName, LoginUrl,
        ConnectorType, DefaultTimeoutSeconds, MaxRetryCount, IsActive
    )
    VALUES (
        'CONN-01', 'VEND-01', 'TransBingo Portal Crawler', 'http://localhost:8085/demo-vendor/login',
        'Browser Automation', 30, 2, 1
    );
END;

-- 5. 13 Navigation Steps for TransBingo Portal Crawler
DELETE FROM VendorNavigationStep WHERE VendorConnectorId = 'CONN-01';

INSERT INTO VendorNavigationStep (VendorNavigationStepId, VendorConnectorId, SequenceNo, StepCode, ActionType, SelectorStrategy, SelectorValue, InputSource, StaticValue, Description, TimeoutSeconds, RetryCount, IsRequired, IsActive)
VALUES 
('STEP-1',  'CONN-01', 1,  'STEP_NAVIGATE_LOGIN',   'NAVIGATE',  'css',         '/demo-vendor/login',     'STATIC',           '/demo-vendor/login',     'Open Login URL', 15, 2, 1, 1),
('STEP-2',  'CONN-01', 2,  'STEP_FILL_USERNAME',     'FILL',      'data-testid', 'username-input',         'SECRET_USERNAME',  NULL,                     'Enter username', 5, 1, 1, 1),
('STEP-3',  'CONN-01', 3,  'STEP_FILL_PASSWORD',     'FILL',      'data-testid', 'password-input',         'SECRET_PASSWORD',  NULL,                     'Enter password', 5, 1, 1, 1),
('STEP-4',  'CONN-01', 4,  'STEP_CLICK_LOGIN',       'CLICK',     'data-testid', 'login-btn',              NULL,               NULL,                     'Click Login button', 10, 2, 1, 1),
('STEP-5',  'CONN-01', 5,  'STEP_WAIT_DASHBOARD',    'WAIT_FOR',  'data-testid', 'dashboard-view',         NULL,               NULL,                     'Wait for Dashboard', 15, 2, 1, 1),
('STEP-6',  'CONN-01', 6,  'STEP_CLICK_REPORTS_MENU','CLICK',     'data-testid', 'menu-reports',           NULL,               NULL,                     'Click Reports menu', 5, 1, 1, 1),
('STEP-7',  'CONN-01', 7,  'STEP_CLICK_COL_REPORT',  'CLICK',     'data-testid', 'menu-collection-report', NULL,               NULL,                     'Click Collection Report', 8, 2, 1, 1),
('STEP-8',  'CONN-01', 8,  'STEP_SELECT_SCHOOL',     'SELECT',    'data-testid', 'school-select',          'SCHOOL_MAPPING',   NULL,                     'Select School from dropdown', 5, 1, 1, 1),
('STEP-9',  'CONN-01', 9,  'STEP_SET_FROM_DATE',     'SET_DATE',  'data-testid', 'from-date',              'BUSINESS_DATE',    NULL,                     'Set From Date = Business Date', 5, 1, 1, 1),
('STEP-10', 'CONN-01', 10, 'STEP_SET_TO_DATE',       'SET_DATE',  'data-testid', 'to-date',                'BUSINESS_DATE',    NULL,                     'Set To Date = Business Date', 5, 1, 1, 1),
('STEP-11', 'CONN-01', 11, 'STEP_CLICK_SEARCH',      'CLICK',     'data-testid', 'search-btn',             NULL,               NULL,                     'Click Search', 15, 2, 1, 1),
('STEP-12', 'CONN-01', 12, 'STEP_WAIT_REPORT_TABLE', 'WAIT_FOR',  'data-testid', 'report-table',           NULL,               NULL,                     'Wait for Report Result table', 20, 2, 1, 1),
('STEP-13', 'CONN-01', 13, 'STEP_DOWNLOAD_XLSX',     'DOWNLOAD',  'data-testid', 'export-excel-btn',       NULL,               NULL,                     'Click Export Excel', 30, 2, 1, 1);

-- 6. Report Definition
IF NOT EXISTS (SELECT 1 FROM VendorReportDefinition WHERE VendorReportDefinitionId = 'REPDEF-01')
BEGIN
    INSERT INTO VendorReportDefinition (
        VendorReportDefinitionId, VendorId, VendorConnectorId, ReportCode,
        ReportName, DateFormat, ExpectedFileType, ExpectedFilenamePattern,
        DownloadTimeoutSeconds, MinimumFileSizeBytes, IsActive
    )
    VALUES (
        'REPDEF-01', 'VEND-01', 'CONN-01', 'DAILY_COLLECTION_REPORT',
        'Daily Collection Report', 'DD/MM/YYYY', 'XLSX', 'TransBingo_Collection_*.xlsx',
        30, 40960, 1
    );
END;

-- 7. Report Parameters
DELETE FROM VendorReportParameter WHERE VendorReportDefinitionId = 'REPDEF-01';

INSERT INTO VendorReportParameter (
    VendorReportParameterId, VendorReportDefinitionId, ParameterCode,
    ParameterType, SelectorStrategy, SelectorValue, ValueSource, StaticValue, SequenceNo, IsRequired
)
VALUES 
('RPARAM-01', 'REPDEF-01', 'schoolCode', 'STRING', 'data-testid', 'school-select', 'SCHOOL_MAPPING', NULL, 1, 1),
('RPARAM-02', 'REPDEF-01', 'date',       'DATE',   'data-testid', 'from-date',     'BUSINESS_DATE',  NULL, 2, 1);

-- 8. School Mappings
DELETE FROM VendorSchoolMapping WHERE VendorId = 'VEND-01';

INSERT INTO VendorSchoolMapping (
    VendorSchoolMappingId, VendorId, SchoolId, VendorSchoolCode, VendorSchoolName, IsActive
)
VALUES
('MAP-01', 'VEND-01', 'SCH-004', 'UTTARA_MDL', 'Uttara Model High School', 1),
('MAP-02', 'VEND-01', 'SCH-001', 'ABC_INT',    'ABC School', 1),
('MAP-03', 'VEND-01', 'SCH-009', 'DHAKA_MDL',  'Dhaka Model School', 1);

GO

GO

-- SECTION: seed/02_Seed_Other_Vendors.sql
-- Seed Data: Additional Vendors (EduPay, SchoolSoft)
IF NOT EXISTS (SELECT 1 FROM Vendor WHERE VendorId = 'VEND-02')
BEGIN
    INSERT INTO Vendor (VendorId, VendorCode, VendorName, PortalUrl, ConnectorType, IsActive, CreatedBy, UpdatedBy, RowVersion)
    VALUES ('VEND-02', 'EDUPAY', 'EduPay', 'https://api.edupay.com.bd/v2', 'API', 1, 'MIGRATION', 'MIGRATION', 1);

    INSERT INTO VendorCredentialReference (
        VendorCredentialReferenceId, VendorId, Environment, SecretProvider,
        SecretReference, AuthenticationType, IsConfigured
    )
    VALUES (
        'sec-edupay-02', 'VEND-02', 'PRODUCTION', 'DevelopmentSecretProvider',
        'vault://edupay/prod/api_key_v2', 'API Key', 1
    );

    INSERT INTO VendorConnector (
        VendorConnectorId, VendorId, ConnectorName, LoginUrl,
        ConnectorType, DefaultTimeoutSeconds, MaxRetryCount, IsActive
    )
    VALUES (
        'CONN-02', 'VEND-02', 'EduPay REST Ingestion Adapter', 'https://api.edupay.com.bd/v2/auth/token',
        'API', 15, 3, 1
    );
END;

IF NOT EXISTS (SELECT 1 FROM Vendor WHERE VendorId = 'VEND-03')
BEGIN
    INSERT INTO Vendor (VendorId, VendorCode, VendorName, PortalUrl, ConnectorType, IsActive, CreatedBy, UpdatedBy, RowVersion)
    VALUES ('VEND-03', 'SCHOOLSOFT', 'SchoolSoft', 'https://schoolsoft.com.bd/portal', 'Browser Automation', 1, 'MIGRATION', 'MIGRATION', 1);

    INSERT INTO VendorCredentialReference (
        VendorCredentialReferenceId, VendorId, Environment, SecretProvider,
        SecretReference, AuthenticationType, IsConfigured
    )
    VALUES (
        'sec-schoolsoft-03', 'VEND-03', 'PRODUCTION', 'DevelopmentSecretProvider',
        'vault://schoolsoft/prod/operator', 'Username + Password', 1
    );

    INSERT INTO VendorConnector (
        VendorConnectorId, VendorId, ConnectorName, LoginUrl,
        ConnectorType, DefaultTimeoutSeconds, MaxRetryCount, IsActive
    )
    VALUES (
        'CONN-03', 'VEND-03', 'SchoolSoft Web Crawler', 'https://schoolsoft.com.bd/portal/login',
        'Browser Automation', 25, 2, 1
    );
END;
GO

GO

