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
