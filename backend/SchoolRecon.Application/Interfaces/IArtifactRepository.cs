using System.Threading.Tasks;
using SchoolRecon.Domain.Entities;

namespace SchoolRecon.Application.Interfaces;

public interface IArtifactRepository
{
    Task<VendorArtifact> InsertAsync(VendorArtifact artifact);
    Task<VendorArtifact?> GetByIdAsync(string artifactId);
}