using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using SchoolRecon.Application.Interfaces;
using SchoolRecon.Domain.Entities;
using SchoolRecon.Infrastructure.Data;

namespace SchoolRecon.Infrastructure.Repositories;

public class NavigationStepRepository : INavigationStepRepository
{
    private readonly IDbConnectionFactory _factory;

    public NavigationStepRepository(IDbConnectionFactory factory)
    {
        _factory = factory;
    }

    public async Task<IEnumerable<VendorNavigationStep>> GetByConnectorAsync(string connectorId)
    {
        using var conn = _factory.CreateConnection();
        var p = new DynamicParameters();
        p.Add("@VendorConnectorId", connectorId);
        return await conn.QueryAsync<VendorNavigationStep>("sp_VendorNavigationStep_GetByConnector", p, commandType: CommandType.StoredProcedure);
    }

    public async Task SaveBatchAsync(string connectorId, IEnumerable<VendorNavigationStep> steps)
    {
        using var conn = _factory.CreateConnection();
        if (conn.State != ConnectionState.Open) conn.Open();
        using var tx = conn.BeginTransaction();

        try
        {
            await conn.ExecuteAsync("sp_VendorNavigationStep_DeleteByConnector", new { VendorConnectorId = connectorId }, tx, commandType: CommandType.StoredProcedure);

            foreach (var step in steps)
            {
                var p = new DynamicParameters();
                p.Add("@VendorNavigationStepId", step.VendorNavigationStepId);
                p.Add("@VendorConnectorId", connectorId);
                p.Add("@SequenceNo", step.SequenceNo);
                p.Add("@StepCode", step.StepCode);
                p.Add("@ActionType", step.ActionType);
                p.Add("@SelectorStrategy", step.SelectorStrategy);
                p.Add("@SelectorValue", step.SelectorValue);
                p.Add("@InputSource", step.InputSource);
                p.Add("@StaticValue", step.StaticValue);
                p.Add("@Description", step.Description);
                p.Add("@TimeoutSeconds", step.TimeoutSeconds);
                p.Add("@RetryCount", step.RetryCount);
                p.Add("@IsRequired", step.IsRequired);
                p.Add("@IsActive", step.IsActive);

                await conn.ExecuteAsync("sp_VendorNavigationStep_Save", p, tx, commandType: CommandType.StoredProcedure);
            }
            tx.Commit();
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }

    public async Task DeleteAsync(string stepId)
    {
        using var conn = _factory.CreateConnection();
        var p = new DynamicParameters();
        p.Add("@VendorNavigationStepId", stepId);
        await conn.ExecuteAsync("sp_VendorNavigationStep_Delete", p, commandType: CommandType.StoredProcedure);
    }
}
