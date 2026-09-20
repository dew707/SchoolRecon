-- ============================================================================
-- SchoolRecon Database Deployment Script (SQL Server 2022)
-- Milestone 2: Configuration Backend & Stored Procedures
-- ============================================================================

PRINT 'Starting SchoolRecon Schema & Seed Deployment...';
GO

-- 1. Tables
:r ../tables/01_Vendor.sql
:r ../tables/02_VendorCredentialReference.sql
:r ../tables/03_VendorConnector.sql
:r ../tables/04_VendorNavigationStep.sql
:r ../tables/05_VendorReportDefinition.sql
:r ../tables/06_VendorReportParameter.sql
:r ../tables/07_School.sql
:r ../tables/08_VendorSchoolMapping.sql
:r ../tables/09_VendorCollectionJob.sql
:r ../tables/10_VendorCollectionEvent.sql
:r ../tables/11_VendorArtifact.sql
:r ../tables/12_AuditLog.sql
GO

-- 2. Stored Procedures
:r ../stored-procedures/sp_Vendor_Procedures.sql
:r ../stored-procedures/sp_Connector_Procedures.sql
:r ../stored-procedures/sp_NavigationStep_Procedures.sql
:r ../stored-procedures/sp_ReportDefinition_Procedures.sql
:r ../stored-procedures/sp_SchoolMapping_Procedures.sql
:r ../stored-procedures/sp_CollectionJob_Procedures.sql
:r ../stored-procedures/sp_Artifact_Procedures.sql
GO

-- 3. Seed Data
:r ../seed/01_Seed_TransBingo_Demo.sql
:r ../seed/02_Seed_Other_Vendors.sql
GO

PRINT 'SchoolRecon Database Deployment Completed Successfully.';
GO
