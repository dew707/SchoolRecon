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
