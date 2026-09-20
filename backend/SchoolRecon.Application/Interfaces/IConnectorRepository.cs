using System.Threading.Tasks;
using SchoolRecon.Domain.Entities;

namespace SchoolRecon.Application.Interfaces;

public interface IConnectorRepository
{
    Task<VendorConnector?> GetByVendorAsync(string vendorId);
    Task<VendorConnector> SaveAsync(VendorConnector connector);
}