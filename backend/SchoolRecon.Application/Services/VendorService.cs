using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SchoolRecon.Application.DTOs;
using SchoolRecon.Application.Interfaces;
using SchoolRecon.Domain.Entities;
using SchoolRecon.Domain.Exceptions;

namespace SchoolRecon.Application.Services;

public class VendorService : IVendorService
{
    private static readonly HashSet<string> SupportedConnectorTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "Browser Automation",
        "API",
        "Manual Upload",
        "SFTP / File Transfer"
    };

    private readonly IVendorRepository _vendorRepo;
    private readonly IConnectorRepository _connectorRepo;
    private readonly INavigationStepRepository _stepRepo;
    private readonly IReportDefinitionRepository _reportRepo;
    private readonly ISchoolMappingRepository _mappingRepo;
    private readonly IAuditService _auditService;

    public VendorService(
        IVendorRepository vendorRepo,
        IConnectorRepository connectorRepo,
        INavigationStepRepository stepRepo,
        IReportDefinitionRepository reportRepo,
        ISchoolMappingRepository mappingRepo,
        IAuditService auditService)
    {
        _vendorRepo = vendorRepo;
        _connectorRepo = connectorRepo;
        _stepRepo = stepRepo;
        _reportRepo = reportRepo;
        _mappingRepo = mappingRepo;
        _auditService = auditService;
    }

    public async Task<IEnumerable<VendorDto>> GetVendorsAsync()
    {
        var vendors = await _vendorRepo.GetAllAsync();
        var dtos = new List<VendorDto>();

        foreach (var v in vendors)
        {
            var connector = await _connectorRepo.GetByVendorAsync(v.VendorId);
            var cred = await _vendorRepo.GetCredentialReferenceAsync(v.VendorId);
            var repDef = await _reportRepo.GetByVendorAsync(v.VendorId);

            var dto = new VendorDto
            {
                Id = v.VendorId,
                Code = v.VendorCode,
                Name = v.VendorName,
                PortalUrl = v.PortalUrl,
                LoginUrl = connector?.LoginUrl ?? "",
                ConnectorType = v.ConnectorType,
                AuthType = cred?.AuthenticationType ?? "Username + Password",
                SchoolsCount = 0,
                IsActive = v.IsActive,
                RowVersion = v.RowVersion,
                CredentialReference = new CredentialReferenceDto
                {
                    SecretId = cred?.VendorCredentialReferenceId ?? "",
                    SecretProvider = cred?.SecretProvider ?? "DevelopmentSecretProvider",
                    VaultPath = cred?.SecretReference ?? "",
                    UsernameIdentifier = "demo-operator",
                    CredentialConfigured = cred?.IsConfigured ?? true
                }
            };

            if (connector != null)
            {
                var steps = await _stepRepo.GetByConnectorAsync(connector.VendorConnectorId);
                dto.NavigationSteps = steps.Select(s => new NavigationStepDto
                {
                    Id = s.VendorNavigationStepId,
                    Sequence = s.SequenceNo,
                    StepCode = s.StepCode,
                    Action = s.ActionType,
                    SelectorStrategy = s.SelectorStrategy,
                    Selector = s.SelectorValue,
                    Value = s.StaticValue ?? s.InputSource,
                    Description = s.Description,
                    TimeoutMs = s.TimeoutSeconds * 1000,
                    RetryCount = s.RetryCount,
                    IsRequired = s.IsRequired,
                    IsActive = s.IsActive
                }).ToList();
            }

            if (repDef != null)
            {
                dto.ReportDefinition = new ReportDefinitionDto
                {
                    ReportDefinitionId = repDef.VendorReportDefinitionId,
                    ReportCode = repDef.ReportCode,
                    ReportName = repDef.ReportName,
                    DateFormat = repDef.DateFormat,
                    ExpectedFileType = repDef.ExpectedFileType,
                    FilenamePattern = repDef.ExpectedFilenamePattern,
                    DownloadTimeoutSec = repDef.DownloadTimeoutSeconds,
                    MinExpectedFileSizeKb = (int)(repDef.MinimumFileSizeBytes / 1024)
                };
            }

            var mappings = await _mappingRepo.GetByVendorAsync(v.VendorId);
            dto.SchoolMappings = mappings.Select(m => new SchoolMappingDto
            {
                MappingId = m.VendorSchoolMappingId,
                InternalSchoolId = m.SchoolId,
                VendorSchoolCode = m.VendorSchoolCode,
                VendorSchoolLabel = m.VendorSchoolName,
                IsActive = m.IsActive
            }).ToList();
            dto.SchoolsCount = dto.SchoolMappings.Count;

            dtos.Add(dto);
        }

        return dtos;
    }

    public async Task<VendorDto?> GetVendorByIdAsync(string id)
    {
        var vendors = await GetVendorsAsync();
        return vendors.FirstOrDefault(v => v.Id == id);
    }

    public async Task<VendorDto> CreateVendorAsync(VendorDto dto, string user)
    {
        await ValidateBasicInformationAsync(dto, null);

        var vendor = new Vendor
        {
            VendorId = string.IsNullOrWhiteSpace(dto.Id) ? $"VEND-{Guid.NewGuid():N}" : dto.Id.Trim(),
            VendorCode = dto.Code.Trim().ToUpperInvariant(),
            VendorName = dto.Name.Trim(),
            PortalUrl = NormalizePortalUrl(dto.PortalUrl),
            ConnectorType = dto.ConnectorType.Trim(),
            IsActive = dto.IsActive,
            CreatedBy = user,
            UpdatedBy = user
        };

        var created = await _vendorRepo.CreateAsync(vendor);
        await _auditService.LogAsync("Vendor", created.VendorId, "CREATE", user, null,
            new { created.VendorCode, created.VendorName, created.ConnectorType, created.IsActive });

        return (await GetVendorByIdAsync(created.VendorId))!;
    }

    public async Task<VendorDto> UpdateVendorAsync(string id, VendorDto dto, string user)
    {
        if (string.IsNullOrWhiteSpace(id))
            throw new DomainValidationException("Vendor ID is required.");

        var existing = await _vendorRepo.GetByIdAsync(id);
        if (existing == null)
            throw new EntityNotFoundException($"Vendor '{id}' not found.");

        await ValidateBasicInformationAsync(dto, existing.VendorId);

        existing.VendorName = dto.Name;
        existing.PortalUrl = dto.PortalUrl;
        existing.ConnectorType = dto.ConnectorType;
        existing.IsActive = dto.IsActive;
        existing.UpdatedBy = user;

        var updated = await _vendorRepo.UpdateAsync(existing, dto.RowVersion);

        // Also save connector login url if changed
        var conn = await _connectorRepo.GetByVendorAsync(id);
        if (conn != null && !string.IsNullOrWhiteSpace(dto.LoginUrl) && conn.LoginUrl != dto.LoginUrl)
        {
            conn.LoginUrl = dto.LoginUrl;
            await _connectorRepo.SaveAsync(conn);
        }

        await _auditService.LogAsync("Vendor", id, "UPDATE", user, new { existing.VendorName, existing.RowVersion }, new { updated.VendorName, updated.RowVersion });

        var reloaded = await GetVendorByIdAsync(id);
        return reloaded!;
    }

    private async Task ValidateBasicInformationAsync(VendorDto dto, string? currentVendorId)
    {
        var errors = new List<string>();
        if (string.IsNullOrWhiteSpace(dto.Code)) errors.Add("Vendor Code is required.");
        if (string.IsNullOrWhiteSpace(dto.Name)) errors.Add("Vendor Name is required.");
        if (string.IsNullOrWhiteSpace(dto.ConnectorType) || !SupportedConnectorTypes.Contains(dto.ConnectorType.Trim()))
            errors.Add("Connector Type must be one of: Browser Automation, API, Manual Upload, SFTP / File Transfer.");

        if (!string.IsNullOrWhiteSpace(dto.PortalUrl) &&
            (!Uri.TryCreate(dto.PortalUrl.Trim(), UriKind.Absolute, out var portalUri) ||
             (portalUri.Scheme != Uri.UriSchemeHttp && portalUri.Scheme != Uri.UriSchemeHttps)))
        {
            errors.Add("Portal URL must be a valid absolute HTTP or HTTPS URL.");
        }

        if (!string.IsNullOrWhiteSpace(dto.Code))
        {
            var vendors = await _vendorRepo.GetAllAsync();
            if (vendors.Any(v => !string.Equals(v.VendorId, currentVendorId, StringComparison.OrdinalIgnoreCase) &&
                                 string.Equals(v.VendorCode, dto.Code.Trim(), StringComparison.OrdinalIgnoreCase)))
            {
                errors.Add($"Vendor Code '{dto.Code.Trim()}' already exists.");
            }
        }

        if (errors.Count > 0) throw new DomainValidationException(errors);
    }

    private static string? NormalizePortalUrl(string? portalUrl) =>
        string.IsNullOrWhiteSpace(portalUrl) ? null : portalUrl.Trim();

    public async Task<bool> TestConnectionAsync(string vendorId)
    {
        var conn = await _connectorRepo.GetByVendorAsync(vendorId);
        if (conn == null) return false;
        return true;
    }
}
