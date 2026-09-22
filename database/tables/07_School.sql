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
