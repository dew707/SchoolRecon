using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SchoolRecon.Application.DTOs;
using SchoolRecon.Application.Interfaces;

namespace SchoolRecon.Api.Controllers;

[ApiController]
[Route("api/collection-jobs")]
public class CollectionJobsController : ControllerBase
{
    private readonly ICollectionJobService _jobService;

    public CollectionJobsController(ICollectionJobService jobService)
    {
        _jobService = jobService;
    }

    [HttpGet("{jobId}")]
    public async Task<ActionResult<CollectionJobDto>> GetById(string jobId)
    {
        var job = await _jobService.GetJobAsync(jobId);
        if (job == null) return NotFound(new { error = "NOT_FOUND", message = $"Job '{jobId}' not found." });
        return Ok(job);
    }

    [HttpGet("{jobId}/events")]
    public async Task<ActionResult<IEnumerable<CollectionEventDto>>> GetEvents(string jobId)
    {
        var events = await _jobService.GetEventsAsync(jobId);
        return Ok(events);
    }
}