using System.Data;

namespace SchoolRecon.Infrastructure.Data;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}