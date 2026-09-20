using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using SchoolRecon.Application.Interfaces;
using SchoolRecon.Domain.Entities;
using SchoolRecon.Infrastructure.Data;

namespace SchoolRecon.Infrastructure.Repositories;

public class CollectionJobRepository : ICollectionJobRepository
{
    private readonly IDbConnectionFactory _factory;

    public CollectionJobRepository(IDbConnectionFactory factory)
    {
        _factory = factory;
    }

    public async Task<VendorCollectionJob> CreateAsync(VendorCollectionJob job)
    {
        using var conn = _factory.CreateConnection();
        var p = new DynamicParameters();
        p.Add("@VendorCollectionJobId", job.VendorCollectionJobId);
        p.Add("@JobReference", job.JobReference);
        p.Add("@VendorId", job.VendorId);
        p.Add("@SchoolId", job.SchoolId);
        p.Add("@BusinessDate", job.BusinessDate);
        p.Add("@CreatedBy", job.CreatedBy);

        return await conn.QuerySingleAsync<VendorCollectionJob>("sp_VendorCollectionJob_Create", p, commandType: CommandType.StoredProcedure);
    }

    public async Task UpdateStatusAsync(string jobId, string status, string? artifactId, string? failureCode, string? failureMessage)
    {
        using var conn = _factory.CreateConnection();
        var p = new DynamicParameters();
        p.Add("@VendorCollectionJobId", jobId);
        p.Add("@Status", status);
        p.Add("@ArtifactId", artifactId);
        p.Add("@FailureCode", failureCode);
        p.Add("@FailureMessage", failureMessage);

        await conn.ExecuteAsync("sp_VendorCollectionJob_UpdateStatus", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<VendorCollectionJob?> GetByIdAsync(string jobId)
    {
        using var conn = _factory.CreateConnection();
        var p = new DynamicParameters();
        p.Add("@VendorCollectionJobId", jobId);
        return await conn.QuerySingleOrDefaultAsync<VendorCollectionJob>("sp_VendorCollectionJob_GetById", p, commandType: CommandType.StoredProcedure);
    }

    public async Task AddEventAsync(VendorCollectionEvent evt)
    {
        using var conn = _factory.CreateConnection();
        var p = new DynamicParameters();
        p.Add("@VendorCollectionEventId", evt.VendorCollectionEventId);
        p.Add("@VendorCollectionJobId", evt.VendorCollectionJobId);
        p.Add("@SequenceNo", evt.SequenceNo);
        p.Add("@EventType", evt.EventType);
        p.Add("@Stage", evt.Stage);
        p.Add("@Message", evt.Message);
        p.Add("@IsError", evt.IsError);

        await conn.ExecuteAsync("sp_VendorCollectionEvent_Insert", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<IEnumerable<VendorCollectionEvent>> GetEventsByJobAsync(string jobId)
    {
        using var conn = _factory.CreateConnection();
        var p = new DynamicParameters();
        p.Add("@VendorCollectionJobId", jobId);
        return await conn.QueryAsync<VendorCollectionEvent>("sp_VendorCollectionEvent_GetByJob", p, commandType: CommandType.StoredProcedure);
    }
}