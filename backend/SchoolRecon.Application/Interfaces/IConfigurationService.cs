using System.Collections.Generic;
using System.Threading.Tasks;
using SchoolRecon.Application.DTOs;

namespace SchoolRecon.Application.Interfaces;

public interface IConfigurationService
{
    Task<VendorConnectorDto?> GetConnectorAsync(string vendorId);
    Task<VendorConnectorDto> SaveConnectorAsync(string vendorId, VendorConnectorDto dto, string user);
    Task<List<NavigationStepDto>> GetNavigationStepsAsync(string vendorId);
    Task<List<NavigationStepDto>> SaveNavigationStepsAsync(string vendorId, List<NavigationStepDto> steps, string user);
    Task<ReportDefinitionDto?> GetReportDefinitionAsync(string vendorId);
    Task<ReportDefinitionDto> SaveReportDefinitionAsync(string vendorId, ReportDefinitionDto dto, string user);
    Task<List<SchoolMappingDto>> GetSchoolMappingsAsync(string vendorId);
    Task<List<SchoolMappingDto>> SaveSchoolMappingsAsync(string vendorId, List<SchoolMappingDto> mappings, string user);
    Task<ExecutionConfigDto> GetExecutionConfigAsync(string vendorId);
}