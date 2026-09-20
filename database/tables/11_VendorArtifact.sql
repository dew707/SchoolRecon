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
        [RowCount] INT NOT NULL,
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

