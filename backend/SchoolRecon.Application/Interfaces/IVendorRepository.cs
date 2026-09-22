using System.Collections.Generic;
using System.Threading.Tasks;
using SchoolRecon.Domain.Entities;

namespace SchoolRecon.Application.Interfaces;

public interface IVendorRepository
{
    Task<IEnumerable<Vendor>> GetAllAsync();
    Task<Vendor?> GetByIdAsync(string vendorId);
    Task<Vendor> CreateAsync(Vendor vendor);
    Task<Vendor> UpdateAsync(Vendor vendor, int expectedRowVersion);
    Task<VendorCredentialReference?> GetCredentialReferenceAsync(string vendorId, string environment);
    Task<VendorCredentialReference> SaveCredentialReferenceAsync(
        VendorCredentialReference credentialReference,
        int expectedRowVersion,
        string updatedBy);
}
