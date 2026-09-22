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
