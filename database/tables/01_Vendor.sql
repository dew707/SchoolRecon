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
