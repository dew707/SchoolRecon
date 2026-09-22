using System.Collections.Generic;
using System.Threading.Tasks;
using SchoolRecon.Domain.Entities;

namespace SchoolRecon.Application.Interfaces;

public interface ISchoolMappingRepository
{
    Task<IEnumerable<VendorSchoolMapping>> GetByVendorAsync(string vendorId);
    Task SaveBatchAsync(string vendorId, IEnumerable<VendorSchoolMapping> mappings);
}