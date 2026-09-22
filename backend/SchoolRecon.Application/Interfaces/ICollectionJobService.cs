using System.Collections.Generic;
using System.Threading.Tasks;
using SchoolRecon.Application.DTOs;

namespace SchoolRecon.Application.Interfaces;

public interface ICollectionJobService
{
    Task<CollectionJobDto> CreateJobAsync(string vendorId, CreateCollectionJobRequest request, string user);
    Task<CollectionJobDto?> GetJobAsync(string jobId);
    Task<IEnumerable<CollectionEventDto>> GetEventsAsync(string jobId);
    Task<ArtifactDto?> GetArtifactAsync(string artifactId);
}