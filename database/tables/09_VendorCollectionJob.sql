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
