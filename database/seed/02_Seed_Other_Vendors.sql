-- Seed Data: Additional Vendors (EduPay, SchoolSoft)
IF NOT EXISTS (SELECT 1 FROM Vendor WHERE VendorId = 'VEND-02')
BEGIN
    INSERT INTO Vendor (VendorId, VendorCode, VendorName, PortalUrl, ConnectorType, IsActive, CreatedBy, UpdatedBy, RowVersion)
    VALUES ('VEND-02', 'EDUPAY', 'EduPay', 'https://api.edupay.com.bd/v2', 'API', 1, 'MIGRATION', 'MIGRATION', 1);

    INSERT INTO VendorCredentialReference (
        VendorCredentialReferenceId, VendorId, Environment, SecretProvider,
        SecretReference, AuthenticationType, IsConfigured
    )
    VALUES (
        'sec-edupay-02', 'VEND-02', 'PRODUCTION', 'DevelopmentSecretProvider',
        'vault://edupay/prod/api_key_v2', 'API Key', 1
    );

    INSERT INTO VendorConnector (
        VendorConnectorId, VendorId, ConnectorName, LoginUrl,
        ConnectorType, DefaultTimeoutSeconds, MaxRetryCount, IsActive
    )
    VALUES (
        'CONN-02', 'VEND-02', 'EduPay REST Ingestion Adapter', 'https://api.edupay.com.bd/v2/auth/token',
        'API', 15, 3, 1
    );
END;

IF NOT EXISTS (SELECT 1 FROM Vendor WHERE VendorId = 'VEND-03')
BEGIN
    INSERT INTO Vendor (VendorId, VendorCode, VendorName, PortalUrl, ConnectorType, IsActive, CreatedBy, UpdatedBy, RowVersion)
    VALUES ('VEND-03', 'SCHOOLSOFT', 'SchoolSoft', 'https://schoolsoft.com.bd/portal', 'Browser Automation', 1, 'MIGRATION', 'MIGRATION', 1);

    INSERT INTO VendorCredentialReference (
        VendorCredentialReferenceId, VendorId, Environment, SecretProvider,
        SecretReference, AuthenticationType, IsConfigured
    )
    VALUES (
        'sec-schoolsoft-03', 'VEND-03', 'PRODUCTION', 'DevelopmentSecretProvider',
        'vault://schoolsoft/prod/operator', 'Username + Password', 1
    );

    INSERT INTO VendorConnector (
        VendorConnectorId, VendorId, ConnectorName, LoginUrl,
        ConnectorType, DefaultTimeoutSeconds, MaxRetryCount, IsActive
    )
    VALUES (
        'CONN-03', 'VEND-03', 'SchoolSoft Web Crawler', 'https://schoolsoft.com.bd/portal/login',
        'Browser Automation', 25, 2, 1
    );
END;
GO
