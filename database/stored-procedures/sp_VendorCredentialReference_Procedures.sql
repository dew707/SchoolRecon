-- Stored Procedures: Vendor Credential Reference Metadata
CREATE OR ALTER PROCEDURE sp_VendorCredentialReference_GetByVendor
    @VendorId VARCHAR(64),
    @Environment VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        c.VendorCredentialReferenceId,
        c.VendorId,
        c.Environment,
        c.SecretProvider,
        c.SecretReference,
        c.AuthenticationType,
        c.IsConfigured,
        c.CreatedAt,
        c.UpdatedAt,
        v.RowVersion
    FROM VendorCredentialReference c
    INNER JOIN Vendor v ON v.VendorId = c.VendorId
    WHERE c.VendorId = @VendorId
      AND c.Environment = @Environment;
END;
GO

CREATE OR ALTER PROCEDURE sp_VendorCredentialReference_Save
    @VendorCredentialReferenceId VARCHAR(64),
    @VendorId VARCHAR(64),
    @Environment VARCHAR(50),
    @SecretProvider VARCHAR(100),
    @SecretReference NVARCHAR(255),
    @AuthenticationType VARCHAR(50),
    @IsConfigured BIT,
    @UpdatedBy NVARCHAR(100),
    @ExpectedRowVersion INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRANSACTION;

    DECLARE @CurrentRowVersion INT;
    SELECT @CurrentRowVersion = RowVersion
    FROM Vendor WITH (UPDLOCK, HOLDLOCK)
    WHERE VendorId = @VendorId;

    IF @CurrentRowVersion IS NULL
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR('Vendor not found', 16, 1);
        RETURN;
    END

    IF @CurrentRowVersion <> @ExpectedRowVersion
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR('Concurrency conflict: Configuration has been modified by another operator.', 16, 2);
        RETURN;
    END

    IF (SELECT COUNT(1) FROM VendorCredentialReference WHERE VendorId = @VendorId AND Environment = @Environment) > 1
    BEGIN
        ROLLBACK TRANSACTION;
        RAISERROR('Conflicting credential references exist for this vendor and environment.', 16, 3);
        RETURN;
    END

    DECLARE @ExistingId VARCHAR(64);
    SELECT @ExistingId = VendorCredentialReferenceId
    FROM VendorCredentialReference WITH (UPDLOCK, HOLDLOCK)
    WHERE VendorId = @VendorId AND Environment = @Environment;

    IF @ExistingId IS NOT NULL
    BEGIN
        UPDATE VendorCredentialReference
        SET SecretProvider = @SecretProvider,
            SecretReference = @SecretReference,
            AuthenticationType = @AuthenticationType,
            IsConfigured = @IsConfigured,
            UpdatedAt = SYSDATETIMEOFFSET()
        WHERE VendorCredentialReferenceId = @ExistingId;

        SET @VendorCredentialReferenceId = @ExistingId;
    END
    ELSE
    BEGIN
        INSERT INTO VendorCredentialReference (
            VendorCredentialReferenceId, VendorId, Environment, SecretProvider,
            SecretReference, AuthenticationType, IsConfigured
        ) VALUES (
            @VendorCredentialReferenceId, @VendorId, @Environment, @SecretProvider,
            @SecretReference, @AuthenticationType, @IsConfigured
        );
    END

    UPDATE Vendor
    SET RowVersion = RowVersion + 1,
        UpdatedAt = SYSDATETIMEOFFSET(),
        UpdatedBy = @UpdatedBy
    WHERE VendorId = @VendorId AND RowVersion = @ExpectedRowVersion;

    COMMIT TRANSACTION;

    EXEC sp_VendorCredentialReference_GetByVendor @VendorId, @Environment;
END;
GO
