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
