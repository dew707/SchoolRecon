using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using SchoolRecon.Api.Middleware;
using SchoolRecon.Api.Controllers;
using SchoolRecon.Application.DTOs;
using SchoolRecon.Application.Interfaces;
using SchoolRecon.Application.Services;
using SchoolRecon.Domain.Entities;
using SchoolRecon.Domain.Exceptions;
using SchoolRecon.Infrastructure.Secrets;
using Xunit;

namespace SchoolRecon.Tests;

public class VendorBasicInformationTests
{
    private static (VendorService Service, MemoryVendorRepository Repository) CreateSubject(params Vendor[] vendors)
    {
        var repository = new MemoryVendorRepository(vendors);
        var service = new VendorService(repository, new EmptyConnectorRepository(), new EmptyStepRepository(),
            new EmptyReportRepository(), new EmptyMappingRepository(), new NoOpAuditService());
        return (service, repository);
    }

    private static Vendor Existing(bool active = true) => new()
    {
        VendorId = "VEND-01", VendorCode = "ALPHA", VendorName = "Alpha School Pay",
        PortalUrl = "https://alpha.example", ConnectorType = "API", IsActive = active, RowVersion = 1
    };

    private static VendorDto ValidDto(string code = "BETA") => new()
    {
        Code = code, Name = "Beta Pay", PortalUrl = "https://beta.example",
        ConnectorType = "Browser Automation", IsActive = true, RowVersion = 1
    };

    private static VendorsController Controller(VendorService service) => new(service, null!, null!)
    {
        ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
    };

    [Fact]
    public async Task Get_list_returns_vendors()
    {
        var (service, _) = CreateSubject(Existing());
        var controller = Controller(service);
        var result = await controller.GetAll();
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        Assert.Single(Assert.IsAssignableFrom<IEnumerable<VendorDto>>(ok.Value));
    }

    [Fact]
    public async Task Get_by_id_returns_vendor_and_unknown_returns_not_found()
    {
        var (service, _) = CreateSubject(Existing());
        var controller = Controller(service);
        Assert.IsType<OkObjectResult>((await controller.GetById("VEND-01")).Result);
        Assert.IsType<NotFoundObjectResult>((await controller.GetById("missing")).Result);
    }

    [Fact]
    public async Task Post_valid_vendor_creates_and_reloads_it()
    {
        var (service, repository) = CreateSubject();
        var controller = Controller(service);
        var result = await controller.Create(ValidDto());
        var created = Assert.IsType<CreatedAtActionResult>(result.Result);
        var dto = Assert.IsType<VendorDto>(created.Value);
        Assert.Equal("BETA", dto.Code);
        Assert.NotNull(await repository.GetByIdAsync(dto.Id));
    }

    [Fact]
    public async Task Put_valid_vendor_updates_values()
    {
        var (service, _) = CreateSubject(Existing());
        var dto = ValidDto("ALPHA");
        dto.Name = "Updated";
        dto.IsActive = false;
        var controller = Controller(service);
        var ok = Assert.IsType<OkObjectResult>((await controller.Update("VEND-01", dto)).Result);
        var updated = Assert.IsType<VendorDto>(ok.Value);
        Assert.Equal("Updated", updated.Name);
        Assert.False(updated.IsActive);
        Assert.Equal(2, updated.RowVersion);
    }

    [Fact]
    public async Task Duplicate_code_is_rejected()
    {
        var (service, _) = CreateSubject(Existing());
        await Assert.ThrowsAsync<DomainValidationException>(() => service.CreateVendorAsync(ValidDto("alpha"), "TEST"));
    }

    [Theory]
    [InlineData("", "Name", "https://valid.example", "API")]
    [InlineData("CODE", "", "https://valid.example", "API")]
    [InlineData("CODE", "Name", "not-a-url", "API")]
    [InlineData("CODE", "Name", "https://valid.example", "Unknown")]
    public async Task Invalid_basic_information_is_rejected(string code, string name, string url, string connector)
    {
        var (service, _) = CreateSubject();
        var dto = ValidDto(code);
        dto.Name = name;
        dto.PortalUrl = url;
        dto.ConnectorType = connector;
        await Assert.ThrowsAsync<DomainValidationException>(() => service.CreateVendorAsync(dto, "TEST"));
    }

    [Fact]
    public async Task Update_of_nonexistent_vendor_is_rejected()
    {
        var (service, _) = CreateSubject();
        await Assert.ThrowsAsync<EntityNotFoundException>(() => service.UpdateVendorAsync("missing", ValidDto(), "TEST"));
    }

    [Fact]
    public async Task Stale_row_version_does_not_overwrite_data()
    {
        var (service, repository) = CreateSubject(Existing());
        var first = ValidDto("ALPHA");
        first.Name = "First update";
        await service.UpdateVendorAsync("VEND-01", first, "TEST");
        var stale = ValidDto("ALPHA");
        stale.Name = "Stale update";
        await Assert.ThrowsAsync<ConcurrencyConflictException>(() => service.UpdateVendorAsync("VEND-01", stale, "TEST"));
        Assert.Equal("First update", (await repository.GetByIdAsync("VEND-01"))!.VendorName);
    }

    [Fact]
    public async Task Concurrency_conflict_is_returned_as_http_409()
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        var middleware = new ExceptionHandlingMiddleware(
            _ => throw new ConcurrencyConflictException("Concurrency conflict"),
            NullLogger<ExceptionHandlingMiddleware>.Instance);
        await middleware.InvokeAsync(context);
        Assert.Equal(StatusCodes.Status409Conflict, context.Response.StatusCode);
    }

    [Theory]
    [InlineData(true, false)]
    [InlineData(false, true)]
    public async Task Active_state_persists(bool initial, bool requested)
    {
        var (service, _) = CreateSubject(Existing(initial));
        var dto = ValidDto("ALPHA");
        dto.IsActive = requested;
        var updated = await service.UpdateVendorAsync("VEND-01", dto, "TEST");
        var reloaded = await service.GetVendorByIdAsync("VEND-01");
        Assert.Equal(requested, updated.IsActive);
        Assert.Equal(requested, reloaded!.IsActive);
    }

    [Fact]
    public async Task Vendor_response_contains_no_resolved_secret_fields()
    {
        var (service, _) = CreateSubject(Existing());
        using var document = JsonDocument.Parse(JsonSerializer.Serialize(await service.GetVendorByIdAsync("VEND-01")));
        var propertyNames = EnumeratePropertyNames(document.RootElement).ToList();
        Assert.DoesNotContain(propertyNames, n => n.Equals("password", StringComparison.OrdinalIgnoreCase));
        Assert.DoesNotContain(propertyNames, n => n.Equals("apiKey", StringComparison.OrdinalIgnoreCase));
        Assert.DoesNotContain(propertyNames, n => n.Equals("resolvedSecret", StringComparison.OrdinalIgnoreCase));
        Assert.DoesNotContain(propertyNames, n => n.Equals("secretValue", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task Secret_provider_fails_closed_for_unknown_reference()
    {
        var provider = new DevelopmentSecretProvider();
        Assert.False(await provider.HasCredentialAsync("vault://unknown/test/reference"));
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            provider.ResolveCredentialAsync("vault://unknown/test/reference"));
    }

    private static IEnumerable<string> EnumeratePropertyNames(JsonElement element)
    {
        if (element.ValueKind == JsonValueKind.Object)
            foreach (var property in element.EnumerateObject())
            {
                yield return property.Name;
                foreach (var child in EnumeratePropertyNames(property.Value)) yield return child;
            }
        else if (element.ValueKind == JsonValueKind.Array)
            foreach (var item in element.EnumerateArray())
                foreach (var child in EnumeratePropertyNames(item)) yield return child;
    }
}

internal sealed class MemoryVendorRepository : IVendorRepository
{
    private readonly Dictionary<string, Vendor> _items;
    private readonly Dictionary<string, VendorCredentialReference> _credentials = new();
    public MemoryVendorRepository(IEnumerable<Vendor> vendors) => _items = vendors.ToDictionary(v => v.VendorId, Clone);
    public Task<IEnumerable<Vendor>> GetAllAsync() => Task.FromResult<IEnumerable<Vendor>>(_items.Values.Select(Clone).ToList());
    public Task<Vendor?> GetByIdAsync(string id) => Task.FromResult(_items.TryGetValue(id, out var value) ? Clone(value) : null);
    public Task<VendorCredentialReference?> GetCredentialReferenceAsync(string id, string environment) =>
        Task.FromResult(_credentials.TryGetValue($"{id}|{environment}", out var value) ? CloneCredential(value) : null);
    public Task<VendorCredentialReference> SaveCredentialReferenceAsync(VendorCredentialReference credential, int expectedRowVersion, string updatedBy)
    {
        var vendor = _items[credential.VendorId];
        if (vendor.RowVersion != expectedRowVersion) throw new ConcurrencyConflictException("Concurrency conflict");
        vendor.RowVersion++;
        credential.RowVersion = vendor.RowVersion;
        _credentials[$"{credential.VendorId}|{credential.Environment}"] = CloneCredential(credential);
        return Task.FromResult(CloneCredential(credential));
    }
    public Task<Vendor> CreateAsync(Vendor vendor) { _items.Add(vendor.VendorId, Clone(vendor)); return Task.FromResult(Clone(vendor)); }
    public Task<Vendor> UpdateAsync(Vendor vendor, int expectedRowVersion)
    {
        var current = _items[vendor.VendorId];
        if (current.RowVersion != expectedRowVersion) throw new ConcurrencyConflictException("Concurrency conflict");
        var saved = Clone(vendor); saved.RowVersion = current.RowVersion + 1; _items[vendor.VendorId] = saved;
        return Task.FromResult(Clone(saved));
    }
    private static Vendor Clone(Vendor v) => new() { VendorId=v.VendorId, VendorCode=v.VendorCode, VendorName=v.VendorName, PortalUrl=v.PortalUrl, ConnectorType=v.ConnectorType, IsActive=v.IsActive, CreatedAt=v.CreatedAt, CreatedBy=v.CreatedBy, UpdatedAt=v.UpdatedAt, UpdatedBy=v.UpdatedBy, RowVersion=v.RowVersion };
    private static VendorCredentialReference CloneCredential(VendorCredentialReference c) => new() { VendorCredentialReferenceId=c.VendorCredentialReferenceId, VendorId=c.VendorId, Environment=c.Environment, SecretProvider=c.SecretProvider, SecretReference=c.SecretReference, AuthenticationType=c.AuthenticationType, IsConfigured=c.IsConfigured, RowVersion=c.RowVersion };
}

internal sealed class EmptyConnectorRepository : IConnectorRepository { public Task<VendorConnector?> GetByVendorAsync(string id) => Task.FromResult<VendorConnector?>(null); public Task<VendorConnector> SaveAsync(VendorConnector v) => Task.FromResult(v); }
internal sealed class EmptyStepRepository : INavigationStepRepository { public Task<IEnumerable<VendorNavigationStep>> GetByConnectorAsync(string id) => Task.FromResult<IEnumerable<VendorNavigationStep>>([]); public Task SaveBatchAsync(string id, IEnumerable<VendorNavigationStep> s) => Task.CompletedTask; public Task DeleteAsync(string id) => Task.CompletedTask; }
internal sealed class EmptyReportRepository : IReportDefinitionRepository { public Task<VendorReportDefinition?> GetByVendorAsync(string id) => Task.FromResult<VendorReportDefinition?>(null); public Task<VendorReportDefinition> SaveDefinitionAsync(VendorReportDefinition d) => Task.FromResult(d); public Task<IEnumerable<VendorReportParameter>> GetParametersAsync(string id) => Task.FromResult<IEnumerable<VendorReportParameter>>([]); public Task SaveParametersBatchAsync(string id, IEnumerable<VendorReportParameter> p) => Task.CompletedTask; }
internal sealed class EmptyMappingRepository : ISchoolMappingRepository { public Task<IEnumerable<VendorSchoolMapping>> GetByVendorAsync(string id) => Task.FromResult<IEnumerable<VendorSchoolMapping>>([]); public Task SaveBatchAsync(string id, IEnumerable<VendorSchoolMapping> m) => Task.CompletedTask; }
internal sealed class NoOpAuditService : IAuditService { public Task LogAsync(string entity, string id, string action, string by, object? oldValues = null, object? newValues = null) => Task.CompletedTask; }
