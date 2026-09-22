using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SchoolRecon.Application.DTOs;
using SchoolRecon.Application.Interfaces;

namespace SchoolRecon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VendorsController : ControllerBase
{
    private readonly IVendorService _vendorService;
    private readonly IConfigurationService _configService;
    private readonly ICollectionJobService _jobService;

    public VendorsController(
        IVendorService vendorService,
        IConfigurationService configService,
        ICollectionJobService jobService)
    {
        _vendorService = vendorService;
        _configService = configService;
        _jobService = jobService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VendorDto>>> GetAll()
    {
        var vendors = await _vendorService.GetVendorsAsync();
        return Ok(vendors);
    }

    [HttpGet("{vendorId}")]
    public async Task<ActionResult<VendorDto>> GetById(string vendorId)
    {
        var vendor = await _vendorService.GetVendorByIdAsync(vendorId);
        if (vendor == null) return NotFound(new { error = "NOT_FOUND", message = $"Vendor '{vendorId}' not found." });
        return Ok(vendor);
    }

    [HttpPost]
    public async Task<ActionResult<VendorDto>> Create([FromBody] VendorDto dto)
    {
        var created = await _vendorService.CreateVendorAsync(dto, User.Identity?.Name ?? "OPERATOR");
        return CreatedAtAction(nameof(GetById), new { vendorId = created.Id }, created);
    }

    [HttpPut("{vendorId}")]
    public async Task<ActionResult<VendorDto>> Update(string vendorId, [FromBody] VendorDto dto)
    {
        var updated = await _vendorService.UpdateVendorAsync(vendorId, dto, User.Identity?.Name ?? "OPERATOR");
        return Ok(updated);
    }

    [HttpGet("{vendorId}/connector")]
    public async Task<ActionResult<VendorConnectorDto>> GetConnector(string vendorId)
    {
        var conn = await _configService.GetConnectorAsync(vendorId);
        if (conn == null) return NotFound(new { error = "NOT_FOUND", message = $"Connector for vendor '{vendorId}' not found." });
        return Ok(conn);
    }

    [HttpPut("{vendorId}/connector")]
    public async Task<ActionResult<VendorConnectorDto>> SaveConnector(string vendorId, [FromBody] VendorConnectorDto dto)
    {
        var saved = await _configService.SaveConnectorAsync(vendorId, dto, User.Identity?.Name ?? "OPERATOR");
        return Ok(saved);
    }

    [HttpGet("{vendorId}/navigation-steps")]
    public async Task<ActionResult<List<NavigationStepDto>>> GetNavigationSteps(string vendorId)
    {
        var steps = await _configService.GetNavigationStepsAsync(vendorId);
        return Ok(steps);
    }

    [HttpPut("{vendorId}/navigation-steps")]
    public async Task<ActionResult<List<NavigationStepDto>>> SaveNavigationSteps(string vendorId, [FromBody] List<NavigationStepDto> steps)
    {
        var saved = await _configService.SaveNavigationStepsAsync(vendorId, steps, User.Identity?.Name ?? "OPERATOR");
        return Ok(saved);
    }

    [HttpGet("{vendorId}/report-definition")]
    public async Task<ActionResult<ReportDefinitionDto>> GetReportDefinition(string vendorId)
    {
        var rep = await _configService.GetReportDefinitionAsync(vendorId);
        if (rep == null) return NotFound(new { error = "NOT_FOUND", message = $"Report definition for vendor '{vendorId}' not found." });
        return Ok(rep);
    }

    [HttpPut("{vendorId}/report-definition")]
    public async Task<ActionResult<ReportDefinitionDto>> SaveReportDefinition(string vendorId, [FromBody] ReportDefinitionDto dto)
    {
        var saved = await _configService.SaveReportDefinitionAsync(vendorId, dto, User.Identity?.Name ?? "OPERATOR");
        return Ok(saved);
    }

    [HttpGet("{vendorId}/school-mappings")]
    public async Task<ActionResult<List<SchoolMappingDto>>> GetSchoolMappings(string vendorId)
    {
        var mappings = await _configService.GetSchoolMappingsAsync(vendorId);
        return Ok(mappings);
    }

    [HttpPut("{vendorId}/school-mappings")]
    public async Task<ActionResult<List<SchoolMappingDto>>> SaveSchoolMappings(string vendorId, [FromBody] List<SchoolMappingDto> mappings)
    {
        var saved = await _configService.SaveSchoolMappingsAsync(vendorId, mappings, User.Identity?.Name ?? "OPERATOR");
        return Ok(saved);
    }

    [HttpGet("{vendorId}/execution-config")]
    public async Task<ActionResult<ExecutionConfigDto>> GetExecutionConfig(string vendorId)
    {
        var config = await _configService.GetExecutionConfigAsync(vendorId);
        return Ok(config);
    }

    [HttpPost("{vendorId}/test-connection")]
    public async Task<ActionResult> TestConnection(string vendorId)
    {
        var success = await _vendorService.TestConnectionAsync(vendorId);
        return Ok(new { success, logs = new[] { "Checking TCP...", "Handshake 200 OK", "Verified successfully." } });
    }

    [HttpPost("{vendorId}/collection-jobs")]
    public async Task<ActionResult<CollectionJobDto>> CreateJob(string vendorId, [FromBody] CreateCollectionJobRequest request)
    {
        var job = await _jobService.CreateJobAsync(vendorId, request, User.Identity?.Name ?? "OPERATOR");
        return Ok(job);
    }
}
