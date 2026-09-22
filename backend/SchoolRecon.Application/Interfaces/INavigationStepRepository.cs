using System.Collections.Generic;
using System.Threading.Tasks;
using SchoolRecon.Domain.Entities;

namespace SchoolRecon.Application.Interfaces;

public interface INavigationStepRepository
{
    Task<IEnumerable<VendorNavigationStep>> GetByConnectorAsync(string connectorId);
    Task SaveBatchAsync(string connectorId, IEnumerable<VendorNavigationStep> steps);
    Task DeleteAsync(string stepId);
}