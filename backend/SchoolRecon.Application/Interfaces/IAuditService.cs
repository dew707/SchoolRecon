using System.Threading.Tasks;

namespace SchoolRecon.Application.Interfaces;

public interface IAuditService
{
    Task LogAsync(string entity, string entityId, string action, string changedBy, object? oldValues = null, object? newValues = null);
}