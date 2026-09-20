-- Table: VendorConnector
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'VendorConnector')
BEGIN
    CREATE TABLE VendorConnector (
        VendorConnectorId VARCHAR(64) NOT NULL PRIMARY KEY,
        VendorId VARCHAR(64) NOT NULL,
        ConnectorName NVARCHAR(150) NOT NULL,
        LoginUrl NVARCHAR(500) NOT NULL,
        ConnectorType VARCHAR(50) NOT NULL,
        DefaultTimeoutSeconds INT NOT NULL CONSTRAINT DF_Conn_Timeout DEFAULT 30,
        MaxRetryCount INT NOT NULL CONSTRAINT DF_Conn_Retry DEFAULT 2,
        IsActive BIT NOT NULL CONSTRAINT DF_Conn_IsActive DEFAULT 1,
        CreatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_Conn_CreatedAt DEFAULT SYSDATETIMEOFFSET(),
        UpdatedAt DATETIMEOFFSET NOT NULL CONSTRAINT DF_Conn_UpdatedAt DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT FK_Conn_Vendor FOREIGN KEY (VendorId) REFERENCES Vendor(VendorId) ON DELETE CASCADE
    );

    CREATE INDEX IX_Conn_VendorId ON VendorConnector(VendorId);
    CREATE INDEX IX_Conn_IsActive ON VendorConnector(IsActive);
END;
GO
