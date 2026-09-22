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
        ContentType, FileSizeBytes, [RowCount], TotalAmount, Sha256
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

