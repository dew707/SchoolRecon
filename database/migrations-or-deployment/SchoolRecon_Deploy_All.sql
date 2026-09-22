-- SQL Server 2022 deployment script for SchoolRecon

GO
USE [SchoolRecon];
GO
-- Core Tables
CREATE TABLE Vendor (VendorId INT PRIMARY KEY, Name NVARCHAR(255));
CREATE TABLE VendorCredentialReference (CredentialId INT PRIMARY KEY, VendorId INT);
CREATE TABLE VendorConnector (ConnectorId INT PRIMARY KEY, VendorId INT);
CREATE TABLE VendorNavigationStep (StepId INT PRIMARY KEY, ConnectorId INT);
CREATE TABLE VendorReportDefinition (ReportId INT PRIMARY KEY, VendorId INT);
CREATE TABLE VendorReportParameter (ParamId INT PRIMARY KEY, ReportId INT);
CREATE TABLE School (SchoolId INT PRIMARY KEY, Name NVARCHAR(255));
CREATE TABLE VendorSchoolMapping (MappingId INT PRIMARY KEY, VendorId INT, SchoolId INT);
CREATE TABLE VendorCollectionJob (JobId INT PRIMARY KEY, VendorId INT, Status NVARCHAR(50));
CREATE TABLE VendorCollectionEvent (EventId INT PRIMARY KEY, JobId INT);
CREATE TABLE VendorArtifact (ArtifactId INT PRIMARY KEY, JobId INT);
CREATE TABLE AuditLog (LogId INT PRIMARY KEY, Timestamp DATETIME);
GO
-- Stored Procedures
CREATE PROCEDURE sp_Vendor_GetAll AS SELECT * FROM Vendor;
GO
CREATE PROCEDURE sp_Vendor_GetById @Id INT AS SELECT * FROM Vendor WHERE VendorId = @Id;
GO
CREATE PROCEDURE sp_Vendor_Create @Name NVARCHAR(255) AS INSERT INTO Vendor (Name) VALUES (@Name);
GO
CREATE PROCEDURE sp_Vendor_Update @Id INT, @Name NVARCHAR(255) AS UPDATE Vendor SET Name = @Name WHERE VendorId = @Id;
GO
CREATE PROCEDURE sp_VendorConnector_GetByVendor @VendorId INT AS SELECT * FROM VendorConnector WHERE VendorId = @VendorId;
GO
CREATE PROCEDURE sp_VendorConnector_Save AS PRINT 'Placeholder';
GO
CREATE PROCEDURE sp_VendorNavigationStep_GetByConnector @ConnectorId INT AS SELECT * FROM VendorNavigationStep WHERE ConnectorId = @ConnectorId;
GO
CREATE PROCEDURE sp_VendorNavigationStep_Save AS PRINT 'Placeholder';
GO
CREATE PROCEDURE sp_VendorNavigationStep_Delete @Id INT AS DELETE FROM VendorNavigationStep WHERE StepId = @Id;
GO
CREATE PROCEDURE sp_VendorReportDefinition_Get AS SELECT * FROM VendorReportDefinition;
GO
CREATE PROCEDURE sp_VendorReportDefinition_Save AS PRINT 'Placeholder';
GO
CREATE PROCEDURE sp_VendorReportParameter_Get AS SELECT * FROM VendorReportParameter;
GO
CREATE PROCEDURE sp_VendorReportParameter_Save AS PRINT 'Placeholder';
GO
CREATE PROCEDURE sp_VendorSchoolMapping_Get AS SELECT * FROM VendorSchoolMapping;
GO
CREATE PROCEDURE sp_VendorSchoolMapping_Save AS PRINT 'Placeholder';
GO
CREATE PROCEDURE sp_VendorCollectionJob_Create AS PRINT 'Placeholder';
GO
CREATE PROCEDURE sp_VendorCollectionJob_GetById @Id INT AS SELECT * FROM VendorCollectionJob WHERE JobId = @Id;
GO
CREATE PROCEDURE sp_VendorCollectionJob_UpdateStatus @Id INT, @Status NVARCHAR(50) AS UPDATE VendorCollectionJob SET Status = @Status WHERE JobId = @Id;
GO
CREATE PROCEDURE sp_VendorCollectionEvent_Insert AS PRINT 'Placeholder';
GO
CREATE PROCEDURE sp_VendorCollectionEvent_GetByJob @JobId INT AS SELECT * FROM VendorCollectionEvent WHERE JobId = @JobId;
GO
CREATE PROCEDURE sp_VendorArtifact_Insert AS PRINT 'Placeholder';
GO
CREATE PROCEDURE sp_VendorArtifact_GetById @Id INT AS SELECT * FROM VendorArtifact WHERE ArtifactId = @Id;
GO
CREATE PROCEDURE sp_AuditLog_Insert AS PRINT 'Placeholder';
GO
-- Seed Data
INSERT INTO Vendor (VendorId, Name) VALUES (1, 'TransBingo Demo');

