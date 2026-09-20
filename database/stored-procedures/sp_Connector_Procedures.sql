-- Stored Procedures: Vendor Connector
CREATE OR ALTER PROCEDURE sp_VendorConnector_GetByVendor
    @VendorId VARCHAR(64)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        VendorConnectorId,
        VendorId,
        ConnectorName,
        LoginUrl,
        ConnectorType,
        DefaultTimeoutSeconds,
        MaxRetryCount,
        IsActive,
        CreatedAt,
        UpdatedAt
    FROM VendorConnector
    WHERE VendorId = @VendorId;
END;
GO

CREATE OR ALTER PROCEDURE sp_VendorConnector_Save
    @VendorConnectorId VARCHAR(64),
    @VendorId VARCHAR(64),
    @ConnectorName NVARCHAR(150),
    @LoginUrl NVARCHAR(500),
    @ConnectorType VARCHAR(50),
    @DefaultTimeoutSeconds INT,
    @MaxRetryCount INT,
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM VendorConnector WHERE VendorConnectorId = @VendorConnectorId)
    BEGIN
        UPDATE VendorConnector
        SET ConnectorName = @ConnectorName,
            LoginUrl = @LoginUrl,
            ConnectorType = @ConnectorType,
            DefaultTimeoutSeconds = @DefaultTimeoutSeconds,
            MaxRetryCount = @MaxRetryCount,
            IsActive = @IsActive,
            UpdatedAt = SYSDATETIMEOFFSET()
        WHERE VendorConnectorId = @VendorConnectorId;
    END
    ELSE
    BEGIN
        INSERT INTO VendorConnector (
            VendorConnectorId, VendorId, ConnectorName, LoginUrl, 
            ConnectorType, DefaultTimeoutSeconds, MaxRetryCount, IsActive
        )
        VALUES (
            @VendorConnectorId, @VendorId, @ConnectorName, @LoginUrl, 
            @ConnectorType, @DefaultTimeoutSeconds, @MaxRetryCount, @IsActive
        );
    END

    SELECT * FROM VendorConnector WHERE VendorConnectorId = @VendorConnectorId;
END;
GO
