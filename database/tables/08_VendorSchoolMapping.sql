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
