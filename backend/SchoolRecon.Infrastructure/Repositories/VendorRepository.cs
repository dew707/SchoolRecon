using System.Collections.Generic;
using System.Data;
using System.Linq;
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
        var rows = await conn.QueryAsync<Vendor>("sp_Vendor_GetAll", commandType: CommandType.StoredProcedure);
        return rows.GroupBy(v => v.VendorId).Select(group => group.First());
    }

    public async Task<Vendor?> GetByIdAsync(string vendorId)
    {
        using var conn = _factory.CreateConnection();
        var p = new DynamicParameters();
        p.Add("@VendorId", vendorId);
        return (await conn.QueryAsync<Vendor>("sp_Vendor_GetById", p, commandType: CommandType.StoredProcedure)).FirstOrDefault();
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

    public async Task<VendorCredentialReference?> GetCredentialReferenceAsync(string vendorId, string environment)
    {
        using var conn = _factory.CreateConnection();
        var p = new DynamicParameters();
        p.Add("@VendorId", vendorId);
        p.Add("@Environment", environment);
        return await conn.QuerySingleOrDefaultAsync<VendorCredentialReference>(
            "sp_VendorCredentialReference_GetByVendor", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<VendorCredentialReference> SaveCredentialReferenceAsync(
        VendorCredentialReference credentialReference,
        int expectedRowVersion,
        string updatedBy)
    {
        using var conn = _factory.CreateConnection();
        var p = new DynamicParameters();
        p.Add("@VendorCredentialReferenceId", credentialReference.VendorCredentialReferenceId);
        p.Add("@VendorId", credentialReference.VendorId);
        p.Add("@Environment", credentialReference.Environment);
        p.Add("@SecretProvider", credentialReference.SecretProvider);
        p.Add("@SecretReference", credentialReference.SecretReference);
        p.Add("@AuthenticationType", credentialReference.AuthenticationType);
        p.Add("@IsConfigured", credentialReference.IsConfigured);
        p.Add("@UpdatedBy", updatedBy);
        p.Add("@ExpectedRowVersion", expectedRowVersion);

        try
        {
            return await conn.QuerySingleAsync<VendorCredentialReference>(
                "sp_VendorCredentialReference_Save", p, commandType: CommandType.StoredProcedure);
        }
        catch (System.Exception ex) when (ex.Message.Contains("Concurrency conflict"))
        {
            throw new ConcurrencyConflictException("Concurrency conflict: Configuration was modified by another operator.");
        }
        catch (System.Exception ex) when (ex.Message.Contains("Vendor not found"))
        {
            throw new EntityNotFoundException($"Vendor '{credentialReference.VendorId}' not found.");
        }
        catch (System.Exception ex) when (ex.Message.Contains("Conflicting credential references"))
        {
            throw new DomainValidationException("Conflicting credential references exist for this vendor and environment.");
        }
    }
}
