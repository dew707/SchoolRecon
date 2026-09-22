-- Stored Procedures: Vendor Navigation Steps
CREATE OR ALTER PROCEDURE sp_VendorNavigationStep_GetByConnector
    @VendorConnectorId VARCHAR(64)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        VendorNavigationStepId,
        VendorConnectorId,
        SequenceNo,
        StepCode,
        ActionType,
        SelectorStrategy,
        SelectorValue,
        InputSource,
        StaticValue,
        Description,
        TimeoutSeconds,
        RetryCount,
        IsRequired,
        IsActive,
        CreatedAt,
        UpdatedAt
    FROM VendorNavigationStep
    WHERE VendorConnectorId = @VendorConnectorId
    ORDER BY SequenceNo ASC;
END;
GO

CREATE OR ALTER PROCEDURE sp_VendorNavigationStep_Save
    @VendorNavigationStepId VARCHAR(64),
    @VendorConnectorId VARCHAR(64),
    @SequenceNo INT,
    @StepCode VARCHAR(50),
    @ActionType VARCHAR(50),
    @SelectorStrategy VARCHAR(50),
    @SelectorValue NVARCHAR(500),
    @InputSource VARCHAR(50) = NULL,
    @StaticValue NVARCHAR(500) = NULL,
    @Description NVARCHAR(500),
    @TimeoutSeconds INT,
    @RetryCount INT,
    @IsRequired BIT,
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM VendorNavigationStep WHERE VendorNavigationStepId = @VendorNavigationStepId)
    BEGIN
        UPDATE VendorNavigationStep
        SET VendorConnectorId = @VendorConnectorId,
            SequenceNo = @SequenceNo,
            StepCode = @StepCode,
            ActionType = @ActionType,
            SelectorStrategy = @SelectorStrategy,
            SelectorValue = @SelectorValue,
            InputSource = @InputSource,
            StaticValue = @StaticValue,
            Description = @Description,
            TimeoutSeconds = @TimeoutSeconds,
            RetryCount = @RetryCount,
            IsRequired = @IsRequired,
            IsActive = @IsActive,
            UpdatedAt = SYSDATETIMEOFFSET()
        WHERE VendorNavigationStepId = @VendorNavigationStepId;
    END
    ELSE
    BEGIN
        INSERT INTO VendorNavigationStep (
            VendorNavigationStepId, VendorConnectorId, SequenceNo, StepCode,
            ActionType, SelectorStrategy, SelectorValue, InputSource, StaticValue,
            Description, TimeoutSeconds, RetryCount, IsRequired, IsActive
        )
        VALUES (
            @VendorNavigationStepId, @VendorConnectorId, @SequenceNo, @StepCode,
            @ActionType, @SelectorStrategy, @SelectorValue, @InputSource, @StaticValue,
            @Description, @TimeoutSeconds, @RetryCount, @IsRequired, @IsActive
        );
    END
END;
GO

CREATE OR ALTER PROCEDURE sp_VendorNavigationStep_Delete
    @VendorNavigationStepId VARCHAR(64)
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM VendorNavigationStep WHERE VendorNavigationStepId = @VendorNavigationStepId;
END;
GO
