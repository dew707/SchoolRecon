using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Data.SqlClient;
using SchoolRecon.Application.Interfaces;
using SchoolRecon.Domain.Entities;
using SchoolRecon.Domain.Exceptions;
using SchoolRecon.Infrastructure.Data;

namespace SchoolRecon.Infrastructure.Repositories;

public class VendorRepository : IVendorRepository
{
    private readonly IDbConnectionFactory _factory;

    public VendorRepository(IDbConnectionFactory factory)
    {
        _factory = factory;
    }

    public async Task<IEnumerable<Vendor>> GetAllAsync()
    {
        using var conn = _factory.CreateConnection();
        return await conn.QueryAsync<Vendor>("sp_Vendor_GetAll", commandType: CommandType.StoredProcedure);
    }

    public async Task<Vendor?> GetByIdAsync(string vendorId)
    {
        using var conn = _factory.CreateConnection();
        var p = new DynamicParameters();
        p.Add("@VendorId", vendorId);
        return await conn.QuerySingleOrDefaultAsync<Vendor>("sp_Vendor_GetById", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<Vendor> CreateAsync(Vendor vendor)
    {
        using var conn = _factory.CreateConnection();
        var p = new DynamicParameters();
        p.Add("@VendorId", vendor.VendorId);
        p.Add("@VendorCode", vendor.VendorCode);
        p.Add("@VendorName", vendor.VendorName);
        p.Add("@PortalUrl", vendor.PortalUrl);
        p.Add("@ConnectorType", vendor.ConnectorType);
        p.Add("@CreatedBy", vendor.CreatedBy);

        try
        {
            return await conn.QuerySingleAsync<Vendor>("sp_Vendor_Create", p, commandType: CommandType.StoredProcedure);
        }
        catch (SqlException ex) when (ex.Number is 2601 or 2627)
        {
            throw new DomainValidationException($"Vendor Code '{vendor.VendorCode}' already exists.");
        }
    }

    public async Task<Vendor> UpdateAsync(Vendor vendor, int expectedRowVersion)
    {
        using var conn = _factory.CreateConnection();
        var p = new DynamicParameters();
        p.Add("@VendorId", vendor.VendorId);
        p.Add("@VendorName", vendor.VendorName);
        p.Add("@PortalUrl", vendor.PortalUrl);
        p.Add("@ConnectorType", vendor.ConnectorType);
        p.Add("@IsActive", vendor.IsActive);
        p.Add("@UpdatedBy", vendor.UpdatedBy);
        p.Add("@ExpectedRowVersion", expectedRowVersion);

        try
        {
            return await conn.QuerySingleAsync<Vendor>("sp_Vendor_Update", p, commandType: CommandType.StoredProcedure);
        }
        catch (System.Exception ex) when (ex.Message.Contains("Concurrency conflict"))
        {
            throw new ConcurrencyConflictException("Concurrency conflict: Configuration was modified by another operator.");
        }
    }

    public async Task<VendorCredentialReference?> GetCredentialReferenceAsync(string vendorId)
    {
        using var conn = _factory.CreateConnection();
        return await conn.QuerySingleOrDefaultAsync<VendorCredentialReference>(
            "SELECT * FROM VendorCredentialReference WHERE VendorId = @VendorId", new { VendorId = vendorId });
    }
}
