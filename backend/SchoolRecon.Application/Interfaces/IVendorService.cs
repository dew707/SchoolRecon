using System.Collections.Generic;
using System.Threading.Tasks;
using SchoolRecon.Application.DTOs;

namespace SchoolRecon.Application.Interfaces;

public interface IVendorService
{
    Task<IEnumerable<VendorDto>> GetVendorsAsync();
    Task<VendorDto?> GetVendorByIdAsync(string id);
    Task<VendorDto> CreateVendorAsync(VendorDto vendorDto, string user);
    Task<VendorDto> UpdateVendorAsync(string id, VendorDto vendorDto, string user);
    Task<bool> TestConnectionAsync(string vendorId);
}
