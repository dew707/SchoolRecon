using System.Data;
using System.Threading.Tasks;
using Dapper;
using SchoolRecon.Application.Interfaces;
using SchoolRecon.Domain.Entities;
using SchoolRecon.Infrastructure.Data;

namespace SchoolRecon.Infrastructure.Repositories;

public class ConnectorRepository : IConnectorRepository
{
    private readonly IDbConnectionFactory _factory;

    public ConnectorRepository(IDbConnectionFactory factory)
    {
        _factory = factory;
    }

    public async Task<VendorConnector?> GetByVendorAsync(string vendorId)
    {
        using var conn = _factory.CreateConnection();
        var p = new DynamicParameters();
        p.Add("@VendorId", vendorId);
        return await conn.QuerySingleOrDefaultAsync<VendorConnector>("sp_VendorConnector_GetByVendor", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<VendorConnector> SaveAsync(VendorConnector connector)
    {
        using var conn = _factory.CreateConnection();
        var p = new DynamicParameters();
        p.Add("@VendorConnectorId", connector.VendorConnectorId);
        p.Add("@VendorId", connector.VendorId);
        p.Add("@ConnectorName", connector.ConnectorName);
        p.Add("@LoginUrl", connector.LoginUrl);
        p.Add("@ConnectorType", connector.ConnectorType);
        p.Add("@DefaultTimeoutSeconds", connector.DefaultTimeoutSeconds);
        p.Add("@MaxRetryCount", connector.MaxRetryCount);
        p.Add("@IsActive", connector.IsActive);

        return await conn.QuerySingleAsync<VendorConnector>("sp_VendorConnector_Save", p, commandType: CommandType.StoredProcedure);
    }
}