-- Stored Procedures: Vendor School Mapping
CREATE OR ALTER PROCEDURE sp_VendorSchoolMapping_Get
    @VendorId VARCHAR(64)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        m.VendorSchoolMappingId,
        m.VendorId,
        m.SchoolId,
        s.SchoolCode AS InternalSchoolCode,
        s.SchoolName AS InternalSchoolName,
        m.VendorSchoolCode,
        m.VendorSchoolName,
        m.IsActive,
        m.CreatedAt,
        m.UpdatedAt
    FROM VendorSchoolMapping m
    INNER JOIN School s ON m.SchoolId = s.SchoolId
    WHERE m.VendorId = @VendorId
    ORDER BY s.SchoolName ASC;
END;
GO

CREATE OR ALTER PROCEDURE sp_VendorSchoolMapping_Save
    @VendorSchoolMappingId VARCHAR(64),
    @VendorId VARCHAR(64),
    @SchoolId VARCHAR(64),
    @VendorSchoolCode VARCHAR(50),
    @VendorSchoolName NVARCHAR(200),
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM VendorSchoolMapping WHERE VendorSchoolMappingId = @VendorSchoolMappingId)
    BEGIN
        UPDATE VendorSchoolMapping
        SET VendorSchoolCode = @VendorSchoolCode,
            VendorSchoolName = @VendorSchoolName,
            IsActive = @IsActive,
            UpdatedAt = SYSDATETIMEOFFSET()
        WHERE VendorSchoolMappingId = @VendorSchoolMappingId;
    END
    ELSE
    BEGIN
        INSERT INTO VendorSchoolMapping (
            VendorSchoolMappingId, VendorId, SchoolId, VendorSchoolCode, VendorSchoolName, IsActive
        )
        VALUES (
            @VendorSchoolMappingId, @VendorId, @SchoolId, @VendorSchoolCode, @VendorSchoolName, @IsActive
        );
    END
END;
GO
