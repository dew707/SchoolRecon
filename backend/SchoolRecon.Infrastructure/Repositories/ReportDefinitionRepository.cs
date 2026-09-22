using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using SchoolRecon.Application.Interfaces;
using SchoolRecon.Domain.Entities;
using SchoolRecon.Infrastructure.Data;

namespace SchoolRecon.Infrastructure.Repositories;

public class ReportDefinitionRepository : IReportDefinitionRepository
{
    private readonly IDbConnectionFactory _factory;

    public ReportDefinitionRepository(IDbConnectionFactory factory)
    {
        _factory = factory;
    }

    public async Task<VendorReportDefinition?> GetByVendorAsync(string vendorId)
    {
        using var conn = _factory.CreateConnection();
        var p = new DynamicParameters();
        p.Add("@VendorId", vendorId);
        return await conn.QuerySingleOrDefaultAsync<VendorReportDefinition>("sp_VendorReportDefinition_Get", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<VendorReportDefinition> SaveDefinitionAsync(VendorReportDefinition def)
    {
        using var conn = _factory.CreateConnection();
        var p = new DynamicParameters();
        p.Add("@VendorReportDefinitionId", def.VendorReportDefinitionId);
        p.Add("@VendorId", def.VendorId);
        p.Add("@VendorConnectorId", def.VendorConnectorId);
        p.Add("@ReportCode", def.ReportCode);
        p.Add("@ReportName", def.ReportName);
        p.Add("@DateFormat", def.DateFormat);
        p.Add("@ExpectedFileType", def.ExpectedFileType);
        p.Add("@ExpectedFilenamePattern", def.ExpectedFilenamePattern);
        p.Add("@DownloadTimeoutSeconds", def.DownloadTimeoutSeconds);
        p.Add("@MinimumFileSizeBytes", def.MinimumFileSizeBytes);
        p.Add("@IsActive", def.IsActive);

        return await conn.QuerySingleAsync<VendorReportDefinition>("sp_VendorReportDefinition_Save", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<IEnumerable<VendorReportParameter>> GetParametersAsync(string reportDefId)
    {
        using var conn = _factory.CreateConnection();
        var p = new DynamicParameters();
        p.Add("@VendorReportDefinitionId", reportDefId);
        return await conn.QueryAsync<VendorReportParameter>("sp_VendorReportParameter_Get", p, commandType: CommandType.StoredProcedure);
    }

    public async Task SaveParametersBatchAsync(string reportDefId, IEnumerable<VendorReportParameter> parameters)
    {
        using var conn = _factory.CreateConnection();
        if (conn.State != ConnectionState.Open) conn.Open();
        using var tx = conn.BeginTransaction();

        try
        {
            await conn.ExecuteAsync("DELETE FROM VendorReportParameter WHERE VendorReportDefinitionId = @ReportDefId", new { ReportDefId = reportDefId }, tx);
            foreach (var param in parameters)
            {
                var p = new DynamicParameters();
                p.Add("@VendorReportParameterId", param.VendorReportParameterId);
                p.Add("@VendorReportDefinitionId", reportDefId);
                p.Add("@ParameterCode", param.ParameterCode);
                p.Add("@ParameterType", param.ParameterType);
                p.Add("@SelectorStrategy", param.SelectorStrategy);
                p.Add("@SelectorValue", param.SelectorValue);
                p.Add("@ValueSource", param.ValueSource);
                p.Add("@StaticValue", param.StaticValue);
                p.Add("@SequenceNo", param.SequenceNo);
                p.Add("@IsRequired", param.IsRequired);

                await conn.ExecuteAsync("sp_VendorReportParameter_Save", p, tx, commandType: CommandType.StoredProcedure);
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