using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SchoolRecon.Application.DTOs;
using SchoolRecon.Application.Interfaces;

namespace SchoolRecon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ArtifactsController : ControllerBase
{
    private readonly ICollectionJobService _jobService;

    public ArtifactsController(ICollectionJobService jobService)
    {
        _jobService = jobService;
    }

    [HttpGet("{artifactId}")]
    public async Task<ActionResult<ArtifactDto>> GetById(string artifactId)
    {
        var art = await _jobService.GetArtifactAsync(artifactId);
        if (art == null) return NotFound(new { error = "NOT_FOUND", message = $"Artifact '{artifactId}' not found." });
        return Ok(art);
    }
}