using System.Text.Json;
using SchoolRecon.Application.DTOs;
using SchoolRecon.Application.Services;
using SchoolRecon.Application.Validators;
using SchoolRecon.Domain.Entities;
using SchoolRecon.Domain.Exceptions;
using Xunit;

namespace SchoolRecon.Tests;

public class PortalAuthenticationConfigurationTests
{
    private static (ConfigurationService Service, MemoryVendorRepository Repository) CreateSubject()
    {
        var repository = new MemoryVendorRepository(new[]
        {
            new Vendor { VendorId="VEND-AUTH", VendorCode="AUTH", VendorName="Auth Vendor", ConnectorType="API", RowVersion=1 }
        });
        return (new ConfigurationService(repository, new EmptyConnectorRepository(), new EmptyStepRepository(),
            new EmptyReportRepository(), new EmptyMappingRepository(), new NoOpAuditService()), repository);
    }

    private static CredentialReferenceDto Valid() => new()
    {
        SecretId="sec-auth-dev", VendorId="VEND-AUTH", Environment="DEMO",
        AuthenticationType="API Key", SecretProvider="DevelopmentSecretProvider",
        VaultPath="vault://acceptance/reference", CredentialConfigured=true, RowVersion=1
    };

    [Fact]
    public async Task Valid_metadata_saves_and_reloads_by_vendor_and_environment()
    {
        var (service, _) = CreateSubject();
        var saved = await service.SaveCredentialReferenceAsync("VEND-AUTH", Valid(), "TEST");
        var reloaded = await service.GetCredentialReferenceAsync("VEND-AUTH", "DEMO");
        Assert.Equal(2, saved.RowVersion);
        Assert.Equal("vault://acceptance/reference", reloaded!.VaultPath);
    }

    [Theory]
    [InlineData("Unsupported", "DevelopmentSecretProvider", "vault://valid/reference")]
    [InlineData("API Key", "UnsupportedProvider", "vault://valid/reference")]
    [InlineData("API Key", "DevelopmentSecretProvider", "")]
    public async Task Invalid_metadata_is_rejected(string authType, string provider, string reference)
    {
        var (service, _) = CreateSubject();
        var dto = Valid(); dto.AuthenticationType=authType; dto.SecretProvider=provider; dto.VaultPath=reference;
        await Assert.ThrowsAsync<DomainValidationException>(() => service.SaveCredentialReferenceAsync("VEND-AUTH", dto, "TEST"));
    }

    [Fact]
    public async Task Nonexistent_vendor_is_rejected()
    {
        var (service, _) = CreateSubject();
        await Assert.ThrowsAsync<EntityNotFoundException>(() => service.SaveCredentialReferenceAsync("missing", Valid(), "TEST"));
    }

    [Fact]
    public async Task Stale_row_version_does_not_overwrite_metadata()
    {
        var (service, _) = CreateSubject();
        var original = Valid();
        await service.SaveCredentialReferenceAsync("VEND-AUTH", original, "TEST");
        original.VaultPath="vault://stale/reference";
        await Assert.ThrowsAsync<ConcurrencyConflictException>(() => service.SaveCredentialReferenceAsync("VEND-AUTH", original, "TEST"));
        Assert.Equal("vault://acceptance/reference", (await service.GetCredentialReferenceAsync("VEND-AUTH", "DEMO"))!.VaultPath);
    }

    [Fact]
    public async Task Response_contains_reference_metadata_but_no_resolved_secret_fields()
    {
        var (service, _) = CreateSubject();
        var saved = await service.SaveCredentialReferenceAsync("VEND-AUTH", Valid(), "TEST");
        var json = JsonSerializer.Serialize(saved);
        Assert.DoesNotContain("password", json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("resolvedSecret", json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("secretValue", json, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Invalid_login_url_is_rejected()
    {
        var connector = new VendorConnectorDto
        {
            LoginUrl="javascript:alert(1)", DefaultTimeoutSeconds=30, MaxRetryCount=2
        };

        Assert.Throws<DomainValidationException>(() => ConfigurationValidator.ValidateConnector(connector));
    }
}
