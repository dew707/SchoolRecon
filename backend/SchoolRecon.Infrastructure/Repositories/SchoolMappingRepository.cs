using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using SchoolRecon.Application.Interfaces;
using SchoolRecon.Domain.Entities;
using SchoolRecon.Infrastructure.Data;

namespace SchoolRecon.Infrastructure.Repositories;

public class SchoolMappingRepository : ISchoolMappingRepository
{
    private readonly IDbConnectionFactory _factory;

    public SchoolMappingRepository(IDbConnectionFactory factory)
    {
        _factory = factory;
    }

    public async Task<IEnumerable<VendorSchoolMapping>> GetByVendorAsync(string vendorId)
    {
        using var conn = _factory.CreateConnection();
        var p = new DynamicParameters();
        p.Add("@VendorId", vendorId);
        return await conn.QueryAsync<VendorSchoolMapping>("sp_VendorSchoolMapping_Get", p, commandType: CommandType.StoredProcedure);
    }

    public async Task SaveBatchAsync(string vendorId, IEnumerable<VendorSchoolMapping> mappings)
    {
        using var conn = _factory.CreateConnection();
        if (conn.State != ConnectionState.Open) conn.Open();
        using var tx = conn.BeginTransaction();

        try
        {
            foreach (var m in mappings)
            {
                var p = new DynamicParameters();
                p.Add("@VendorSchoolMappingId", m.VendorSchoolMappingId);
                p.Add("@VendorId", vendorId);
                p.Add("@SchoolId", m.SchoolId);
                p.Add("@VendorSchoolCode", m.VendorSchoolCode);
                p.Add("@VendorSchoolName", m.VendorSchoolName);
                p.Add("@IsActive", m.IsActive);

                await conn.ExecuteAsync("sp_VendorSchoolMapping_Save", p, tx, commandType: CommandType.StoredProcedure);
            }
            tx.Commit();
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }
}