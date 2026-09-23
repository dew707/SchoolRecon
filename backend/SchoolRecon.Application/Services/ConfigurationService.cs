using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SchoolRecon.Application.DTOs;
using SchoolRecon.Application.Interfaces;
using SchoolRecon.Application.Validators;
using SchoolRecon.Domain.Entities;
using SchoolRecon.Domain.Exceptions;

namespace SchoolRecon.Application.Services;

public class ConfigurationService : IConfigurationService
{
    private readonly IVendorRepository _vendorRepo;
    private readonly IConnectorRepository _connectorRepo;
    private readonly INavigationStepRepository _stepRepo;
    private readonly IReportDefinitionRepository _reportRepo;
    private readonly ISchoolMappingRepository _mappingRepo;
    private readonly IAuditService _auditService;

    public ConfigurationService(
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

    public async Task<VendorConnectorDto?> GetConnectorAsync(string vendorId)
    {
        var c = await _connectorRepo.GetByVendorAsync(vendorId);
        if (c == null) return null;

        var v = await _vendorRepo.GetByIdAsync(vendorId);

        return new VendorConnectorDto
        {
            VendorConnectorId = c.VendorConnectorId,
            VendorId = c.VendorId,
            ConnectorName = c.ConnectorName,
            LoginUrl = c.LoginUrl,
            ConnectorType = c.ConnectorType,
            DefaultTimeoutSeconds = c.DefaultTimeoutSeconds,
            MaxRetryCount = c.MaxRetryCount,
            IsActive = c.IsActive,
            RowVersion = v?.RowVersion ?? 1
        };
    }

    public async Task<VendorConnectorDto> SaveConnectorAsync(string vendorId, VendorConnectorDto dto, string user)
    {
        ConfigurationValidator.ValidateConnector(dto);

        var v = await _vendorRepo.GetByIdAsync(vendorId);
        if (v == null) throw new EntityNotFoundException($"Vendor '{vendorId}' not found.");

        var existing = await _connectorRepo.GetByVendorAsync(vendorId);
        var entity = new VendorConnector
        {
            VendorConnectorId = existing?.VendorConnectorId ?? (string.IsNullOrWhiteSpace(dto.VendorConnectorId) ? $"CONN-{Guid.NewGuid():N}" : dto.VendorConnectorId),
            VendorId = vendorId,
            ConnectorName = dto.ConnectorName,
            LoginUrl = dto.LoginUrl,
            ConnectorType = dto.ConnectorType,
            DefaultTimeoutSeconds = dto.DefaultTimeoutSeconds,
            MaxRetryCount = dto.MaxRetryCount,
            IsActive = dto.IsActive
        };

        v.UpdatedBy = user;
        var updatedVendor = await _vendorRepo.UpdateAsync(v, dto.RowVersion);
        var saved = await _connectorRepo.SaveAsync(entity);

        await _auditService.LogAsync("VendorConnector", entity.VendorConnectorId, "SAVE", user, existing, saved);

        dto.VendorConnectorId = saved.VendorConnectorId;
        dto.RowVersion = updatedVendor.RowVersion;
        return dto;
    }

    public async Task<CredentialReferenceDto?> GetCredentialReferenceAsync(string vendorId, string environment)
    {
        if (string.IsNullOrWhiteSpace(environment))
            throw new DomainValidationException("Environment is required.");

        var vendor = await _vendorRepo.GetByIdAsync(vendorId);
        if (vendor == null) throw new EntityNotFoundException($"Vendor '{vendorId}' not found.");

        var credential = await _vendorRepo.GetCredentialReferenceAsync(vendorId, environment.Trim().ToUpperInvariant());
        return credential == null ? null : MapCredentialReference(credential);
    }

    public async Task<CredentialReferenceDto> SaveCredentialReferenceAsync(string vendorId, CredentialReferenceDto dto, string user)
    {
        dto.VendorId = vendorId;
        ConfigurationValidator.ValidateCredentialReference(dto);
        dto.Environment = dto.Environment.Trim().ToUpperInvariant();

        var vendor = await _vendorRepo.GetByIdAsync(vendorId);
        if (vendor == null) throw new EntityNotFoundException($"Vendor '{vendorId}' not found.");

        var entity = new VendorCredentialReference
        {
            VendorCredentialReferenceId = dto.SecretId.Trim(),
            VendorId = vendorId,
            Environment = dto.Environment,
            SecretProvider = dto.SecretProvider.Trim(),
            SecretReference = dto.VaultPath.Trim(),
            AuthenticationType = dto.AuthenticationType.Trim(),
            IsConfigured = dto.CredentialConfigured
        };

        var saved = await _vendorRepo.SaveCredentialReferenceAsync(entity, dto.RowVersion, user);
        await _auditService.LogAsync("VendorCredentialReference", saved.VendorCredentialReferenceId, "SAVE", user,
            null, new { saved.VendorId, saved.Environment, saved.SecretProvider, saved.AuthenticationType, saved.IsConfigured });
        return MapCredentialReference(saved);
    }

    private static CredentialReferenceDto MapCredentialReference(VendorCredentialReference credential) => new()
    {
        SecretId = credential.VendorCredentialReferenceId,
        VendorId = credential.VendorId,
        Environment = credential.Environment,
        AuthenticationType = credential.AuthenticationType,
        SecretProvider = credential.SecretProvider,
        VaultPath = credential.SecretReference,
        CredentialConfigured = credential.IsConfigured,
        RowVersion = credential.RowVersion
    };

    public async Task<List<NavigationStepDto>> GetNavigationStepsAsync(string vendorId)
    {
        var conn = await _connectorRepo.GetByVendorAsync(vendorId);
        if (conn == null) return new List<NavigationStepDto>();

        var steps = await _stepRepo.GetByConnectorAsync(conn.VendorConnectorId);
        return steps.Select(s => new NavigationStepDto
        {
            Id = s.VendorNavigationStepId,
            Sequence = s.SequenceNo,
            StepCode = s.StepCode,
            Action = s.ActionType,
            SelectorStrategy = s.SelectorStrategy,
            Selector = s.SelectorValue,
            InputSource = s.InputSource,
            StaticValue = s.StaticValue,
            Description = s.Description,
            TimeoutMs = s.TimeoutSeconds * 1000,
            RetryCount = s.RetryCount,
            IsRequired = s.IsRequired,
            IsActive = s.IsActive
        }).OrderBy(s => s.Sequence).ToList();
    }

    public async Task<List<NavigationStepDto>> SaveNavigationStepsAsync(string vendorId, List<NavigationStepDto> steps, string user)
    {
        ConfigurationValidator.ValidateNavigationSteps(steps);

        var conn = await _connectorRepo.GetByVendorAsync(vendorId);
        if (conn == null) throw new EntityNotFoundException($"Connector for vendor '{vendorId}' not found.");

        var entities = steps.Select(s => new VendorNavigationStep
        {
            VendorNavigationStepId = string.IsNullOrWhiteSpace(s.Id) ? $"STEP-{Guid.NewGuid():N}" : s.Id,
            VendorConnectorId = conn.VendorConnectorId,
            SequenceNo = s.Sequence,
            StepCode = s.StepCode.Trim(),
            ActionType = s.Action,
            SelectorStrategy = s.SelectorStrategy,
            SelectorValue = s.Selector,
            InputSource = string.IsNullOrWhiteSpace(s.InputSource) ? null : s.InputSource.Trim(),
            StaticValue = string.IsNullOrWhiteSpace(s.StaticValue) ? null : s.StaticValue,
            Description = s.Description,
            TimeoutSeconds = Math.Max(1, s.TimeoutMs / 1000),
            RetryCount = s.RetryCount,
            IsRequired = s.IsRequired,
            IsActive = s.IsActive
        }).ToList();

        await _stepRepo.SaveBatchAsync(conn.VendorConnectorId, entities);

        var v = await _vendorRepo.GetByIdAsync(vendorId);
        if (v != null)
        {
            v.RowVersion += 1;
            v.UpdatedBy = user;
            await _vendorRepo.UpdateAsync(v, v.RowVersion - 1);
        }

        await _auditService.LogAsync("VendorNavigationStep", conn.VendorConnectorId, "SAVE_BATCH", user, null, new { StepCount = steps.Count });

        return await GetNavigationStepsAsync(vendorId);
    }

    public async Task<ReportDefinitionDto?> GetReportDefinitionAsync(string vendorId)
    {
        var r = await _reportRepo.GetByVendorAsync(vendorId);
        if (r == null) return null;

        var parameters = await _reportRepo.GetParametersAsync(r.VendorReportDefinitionId);

        return new ReportDefinitionDto
        {
            ReportDefinitionId = r.VendorReportDefinitionId,
            ReportCode = r.ReportCode,
            ReportName = r.ReportName,
            DateFormat = r.DateFormat,
            ExpectedFileType = r.ExpectedFileType,
            FilenamePattern = r.ExpectedFilenamePattern,
            DownloadTimeoutSec = r.DownloadTimeoutSeconds,
            MinExpectedFileSizeKb = (int)(r.MinimumFileSizeBytes / 1024),
            Parameters = parameters.Select(p => new ReportParameterDto
            {
                ParameterId = p.VendorReportParameterId,
                ParameterCode = p.ParameterCode,
                ParameterType = p.ParameterType,
                SelectorStrategy = p.SelectorStrategy,
                SelectorValue = p.SelectorValue,
                ValueSource = p.ValueSource,
                StaticValue = p.StaticValue,
                SequenceNo = p.SequenceNo,
                IsRequired = p.IsRequired
            }).OrderBy(p => p.SequenceNo).ToList()
        };
    }

    public async Task<ReportDefinitionDto> SaveReportDefinitionAsync(string vendorId, ReportDefinitionDto dto, string user)
    {
        ConfigurationValidator.ValidateReportDefinition(dto);

        var conn = await _connectorRepo.GetByVendorAsync(vendorId);
        if (conn == null) throw new EntityNotFoundException($"Connector for vendor '{vendorId}' not found.");

        var existing = await _reportRepo.GetByVendorAsync(vendorId);
        var entity = new VendorReportDefinition
        {
            VendorReportDefinitionId = existing?.VendorReportDefinitionId ?? (string.IsNullOrWhiteSpace(dto.ReportDefinitionId) ? $"REPDEF-{Guid.NewGuid():N}" : dto.ReportDefinitionId),
            VendorId = vendorId,
            VendorConnectorId = conn.VendorConnectorId,
            ReportCode = dto.ReportCode,
            ReportName = dto.ReportName,
            DateFormat = dto.DateFormat,
            ExpectedFileType = dto.ExpectedFileType,
            ExpectedFilenamePattern = dto.FilenamePattern,
            DownloadTimeoutSeconds = dto.DownloadTimeoutSec,
            MinimumFileSizeBytes = (long)dto.MinExpectedFileSizeKb * 1024,
            IsActive = true
        };

        var saved = await _reportRepo.SaveDefinitionAsync(entity);

        if (dto.Parameters != null && dto.Parameters.Count > 0)
        {
            var pEntities = dto.Parameters.Select(p => new VendorReportParameter
            {
                VendorReportParameterId = string.IsNullOrWhiteSpace(p.ParameterId) ? $"RPARAM-{Guid.NewGuid():N}" : p.ParameterId,
                VendorReportDefinitionId = saved.VendorReportDefinitionId,
                ParameterCode = p.ParameterCode,
                ParameterType = p.ParameterType,
                SelectorStrategy = p.SelectorStrategy,
                SelectorValue = p.SelectorValue,
                ValueSource = p.ValueSource,
                StaticValue = p.StaticValue,
                SequenceNo = p.SequenceNo,
                IsRequired = p.IsRequired
            });
            await _reportRepo.SaveParametersBatchAsync(saved.VendorReportDefinitionId, pEntities);
        }

        await _auditService.LogAsync("VendorReportDefinition", saved.VendorReportDefinitionId, "SAVE", user, existing, saved);

        return (await GetReportDefinitionAsync(vendorId))!;
    }

    public async Task<List<SchoolMappingDto>> GetSchoolMappingsAsync(string vendorId)
    {
        var mappings = await _mappingRepo.GetByVendorAsync(vendorId);
        return mappings.Select(m => new SchoolMappingDto
        {
            MappingId = m.VendorSchoolMappingId,
            InternalSchoolId = m.SchoolId,
            VendorSchoolCode = m.VendorSchoolCode,
            VendorSchoolLabel = m.VendorSchoolName,
            IsActive = m.IsActive
        }).ToList();
    }

    public async Task<List<SchoolMappingDto>> SaveSchoolMappingsAsync(string vendorId, List<SchoolMappingDto> mappings, string user)
    {
        var entities = mappings.Select(m => new VendorSchoolMapping
        {
            VendorSchoolMappingId = string.IsNullOrWhiteSpace(m.MappingId) ? $"MAP-{Guid.NewGuid():N}" : m.MappingId,
            VendorId = vendorId,
            SchoolId = m.InternalSchoolId,
            VendorSchoolCode = m.VendorSchoolCode,
            VendorSchoolName = m.VendorSchoolLabel,
            IsActive = m.IsActive
        }).ToList();

        await _mappingRepo.SaveBatchAsync(vendorId, entities);
        await _auditService.LogAsync("VendorSchoolMapping", vendorId, "SAVE_BATCH", user, null, new { MappingCount = mappings.Count });

        return await GetSchoolMappingsAsync(vendorId);
    }

    public async Task<ExecutionConfigDto> GetExecutionConfigAsync(string vendorId, string environment)
    {
        var vendor = await _vendorRepo.GetByIdAsync(vendorId);
        if (vendor == null) throw new EntityNotFoundException($"Vendor '{vendorId}' not found.");

        var cred = await _vendorRepo.GetCredentialReferenceAsync(vendorId, environment.Trim().ToUpperInvariant());
        if (cred == null)
            throw new DomainValidationException($"Credential reference for environment '{environment}' is not configured.");
        var connector = await _connectorRepo.GetByVendorAsync(vendorId);
        var steps = connector != null ? await GetNavigationStepsAsync(vendorId) : new List<NavigationStepDto>();
        var repDef = await GetReportDefinitionAsync(vendorId);
        var mappings = await GetSchoolMappingsAsync(vendorId);

        return new ExecutionConfigDto
        {
            Vendor = new ExecutionVendorDto
            {
                VendorId = vendor.VendorId,
                VendorCode = vendor.VendorCode,
                VendorName = vendor.VendorName,
                PortalUrl = vendor.PortalUrl ?? ""
            },
            Credential = new ExecutionCredentialDto
            {
                AuthenticationType = cred.AuthenticationType,
                SecretProvider = cred.SecretProvider,
                SecretReference = cred.SecretReference,
                UsernameIdentifier = string.Empty
            },
            Connector = new ExecutionConnectorDto
            {
                ConnectorId = connector?.VendorConnectorId ?? "",
                ConnectorName = connector?.ConnectorName ?? "",
                LoginUrl = connector?.LoginUrl ?? "",
                DefaultTimeoutSeconds = connector?.DefaultTimeoutSeconds ?? 30,
                MaxRetryCount = connector?.MaxRetryCount ?? 2
            },
            NavigationSteps = steps,
            ReportDefinition = repDef ?? new ReportDefinitionDto(),
            ReportParameters = repDef?.Parameters ?? new List<ReportParameterDto>(),
            SchoolMappings = mappings
        };
    }
}
