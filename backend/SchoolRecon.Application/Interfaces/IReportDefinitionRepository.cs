using System.Collections.Generic;
using System.Threading.Tasks;
using SchoolRecon.Domain.Entities;

namespace SchoolRecon.Application.Interfaces;

public interface IReportDefinitionRepository
{
    Task<VendorReportDefinition?> GetByVendorAsync(string vendorId);
    Task<VendorReportDefinition> SaveDefinitionAsync(VendorReportDefinition definition);
    Task<IEnumerable<VendorReportParameter>> GetParametersAsync(string reportDefId);
    Task SaveParametersBatchAsync(string reportDefId, IEnumerable<VendorReportParameter> parameters);
}