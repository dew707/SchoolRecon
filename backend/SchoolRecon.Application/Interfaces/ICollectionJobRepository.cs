using System.Collections.Generic;
using System.Threading.Tasks;
using SchoolRecon.Domain.Entities;

namespace SchoolRecon.Application.Interfaces;

public interface ICollectionJobRepository
{
    Task<VendorCollectionJob> CreateAsync(VendorCollectionJob job);
    Task UpdateStatusAsync(string jobId, string status, string? artifactId, string? failureCode, string? failureMessage);
    Task<VendorCollectionJob?> GetByIdAsync(string jobId);
    Task AddEventAsync(VendorCollectionEvent evt);
    Task<IEnumerable<VendorCollectionEvent>> GetEventsByJobAsync(string jobId);
}