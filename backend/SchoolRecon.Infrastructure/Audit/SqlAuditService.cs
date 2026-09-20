using System;
using System.Data;
using System.Text.Json;
using System.Threading.Tasks;
using Dapper;
using SchoolRecon.Application.Interfaces;
using SchoolRecon.Infrastructure.Data;

namespace SchoolRecon.Infrastructure.Audit;

public class SqlAuditService : IAuditService
{
    private readonly IDbConnectionFactory _connectionFactory;

    public SqlAuditService(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task LogAsync(string entity, string entityId, string action, string changedBy, object? oldValues = null, object? newValues = null)
    {
        using var conn = _connectionFactory.CreateConnection();
        var p = new DynamicParameters();
        p.Add("@AuditLogId", $"AUD-{Guid.NewGuid():N}");
        p.Add("@Entity", entity);
        p.Add("@EntityId", entityId);
        p.Add("@Action", action);
        p.Add("@ChangedBy", changedBy);
        p.Add("@OldValues", oldValues != null ? JsonSerializer.Serialize(oldValues) : null);
        p.Add("@NewValues", newValues != null ? JsonSerializer.Serialize(newValues) : null);

        await conn.ExecuteAsync("sp_AuditLog_Insert", p, commandType: CommandType.StoredProcedure);
    }
}