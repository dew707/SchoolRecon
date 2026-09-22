-- Stored Procedures: Vendor Operations
CREATE OR ALTER PROCEDURE sp_Vendor_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        v.VendorId,
        v.VendorCode,
        v.VendorName,
        v.PortalUrl,
        v.ConnectorType,
        v.IsActive,
        v.CreatedAt,
        v.CreatedBy,
        v.UpdatedAt,
        v.UpdatedBy,
        v.RowVersion,
        (SELECT COUNT(1) FROM VendorSchoolMapping m WHERE m.VendorId = v.VendorId AND m.IsActive = 1) AS SchoolsCount,
        vc.LoginUrl,
        vcr.AuthenticationType AS AuthType,
        vcr.SecretReference,
        vcr.SecretProvider,
        vcr.IsConfigured AS CredentialConfigured
    FROM Vendor v
    LEFT JOIN VendorConnector vc ON v.VendorId = vc.VendorId AND vc.IsActive = 1
    LEFT JOIN VendorCredentialReference vcr ON v.VendorId = vcr.VendorId
    ORDER BY v.VendorName;
END;
GO

CREATE OR ALTER PROCEDURE sp_Vendor_GetById
    @VendorId VARCHAR(64)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        v.VendorId,
        v.VendorCode,
        v.VendorName,
        v.PortalUrl,
        v.ConnectorType,
        v.IsActive,
        v.CreatedAt,
        v.CreatedBy,
        v.UpdatedAt,
        v.UpdatedBy,
        v.RowVersion,
        (SELECT COUNT(1) FROM VendorSchoolMapping m WHERE m.VendorId = v.VendorId AND m.IsActive = 1) AS SchoolsCount,
        vc.LoginUrl,
        vcr.AuthenticationType AS AuthType,
        vcr.SecretReference,
        vcr.SecretProvider,
        vcr.IsConfigured AS CredentialConfigured
    FROM Vendor v
    LEFT JOIN VendorConnector vc ON v.VendorId = vc.VendorId AND vc.IsActive = 1
    LEFT JOIN VendorCredentialReference vcr ON v.VendorId = vcr.VendorId
    WHERE v.VendorId = @VendorId;
END;
GO

CREATE OR ALTER PROCEDURE sp_Vendor_Create
    @VendorId VARCHAR(64),
    @VendorCode VARCHAR(50),
    @VendorName NVARCHAR(150),
    @PortalUrl NVARCHAR(500),
    @ConnectorType VARCHAR(50),
    @CreatedBy NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Vendor (VendorId, VendorCode, VendorName, PortalUrl, ConnectorType, CreatedBy, UpdatedBy, RowVersion)
    VALUES (@VendorId, @VendorCode, @VendorName, @PortalUrl, @ConnectorType, @CreatedBy, @CreatedBy, 1);

    SELECT * FROM Vendor WHERE VendorId = @VendorId;
END;
GO

CREATE OR ALTER PROCEDURE sp_Vendor_Update
    @VendorId VARCHAR(64),
    @VendorName NVARCHAR(150),
    @PortalUrl NVARCHAR(500),
    @ConnectorType VARCHAR(50),
    @IsActive BIT,
    @UpdatedBy NVARCHAR(100),
    @ExpectedRowVersion INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CurrentRowVersion INT;
    SELECT @CurrentRowVersion = RowVersion FROM Vendor WHERE VendorId = @VendorId;

    IF @CurrentRowVersion IS NULL
    BEGIN
        RAISERROR('Vendor not found', 16, 1);
        RETURN;
    END

    IF @CurrentRowVersion != @ExpectedRowVersion
    BEGIN
        RAISERROR('Concurrency conflict: Configuration has been modified by another operator.', 16, 2);
        RETURN;
    END

    UPDATE Vendor
    SET VendorName = @VendorName,
        PortalUrl = @PortalUrl,
        ConnectorType = @ConnectorType,
        IsActive = @IsActive,
        UpdatedBy = @UpdatedBy,
        UpdatedAt = SYSDATETIMEOFFSET(),
        RowVersion = RowVersion + 1
    WHERE VendorId = @VendorId AND RowVersion = @ExpectedRowVersion;

    SELECT * FROM Vendor WHERE VendorId = @VendorId;
END;
GO
