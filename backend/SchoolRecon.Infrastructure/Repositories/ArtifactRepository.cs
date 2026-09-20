using System.Data;
using System.Threading.Tasks;
using Dapper;
using SchoolRecon.Application.Interfaces;
using SchoolRecon.Domain.Entities;
using SchoolRecon.Infrastructure.Data;

namespace SchoolRecon.Infrastructure.Repositories;

public class ArtifactRepository : IArtifactRepository
{
    private readonly IDbConnectionFactory _factory;

    public ArtifactRepository(IDbConnectionFactory factory)
    {
        _factory = factory;
    }

    public async Task<VendorArtifact> InsertAsync(VendorArtifact artifact)
    {
        using var conn = _factory.CreateConnection();
        var p = new DynamicParameters();
        p.Add("@VendorArtifactId", artifact.VendorArtifactId);
        p.Add("@VendorCollectionJobId", artifact.VendorCollectionJobId);
        p.Add("@VendorId", artifact.VendorId);
        p.Add("@SchoolId", artifact.SchoolId);
        p.Add("@BusinessDate", artifact.BusinessDate);
        p.Add("@OriginalFilename", artifact.OriginalFilename);
        p.Add("@StoredFilename", artifact.StoredFilename);
        p.Add("@StorageLocation", artifact.StorageLocation);
        p.Add("@ContentType", artifact.ContentType);
        p.Add("@FileSizeBytes", artifact.FileSizeBytes);
        p.Add("@RowCount", artifact.RowCount);
        p.Add("@TotalAmount", artifact.TotalAmount);
        p.Add("@Sha256", artifact.Sha256);

        return await conn.QuerySingleAsync<VendorArtifact>("sp_VendorArtifact_Insert", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<VendorArtifact?> GetByIdAsync(string artifactId)
    {
        using var conn = _factory.CreateConnection();
        var p = new DynamicParameters();
        p.Add("@VendorArtifactId", artifactId);
        return await conn.QuerySingleOrDefaultAsync<VendorArtifact>("sp_VendorArtifact_GetById", p, commandType: CommandType.StoredProcedure);
    }
}