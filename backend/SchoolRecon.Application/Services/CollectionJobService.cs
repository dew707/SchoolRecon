using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SchoolRecon.Application.DTOs;
using SchoolRecon.Application.Interfaces;
using SchoolRecon.Domain.Entities;
using SchoolRecon.Domain.Exceptions;

namespace SchoolRecon.Application.Services;

public class CollectionJobService : ICollectionJobService
{
    private readonly ICollectionJobRepository _jobRepo;
    private readonly IArtifactRepository _artifactRepo;
    private readonly IVendorRepository _vendorRepo;

    public CollectionJobService(
        ICollectionJobRepository jobRepo,
        IArtifactRepository artifactRepo,
        IVendorRepository vendorRepo)
    {
        _jobRepo = jobRepo;
        _artifactRepo = artifactRepo;
        _vendorRepo = vendorRepo;
    }

    public async Task<CollectionJobDto> CreateJobAsync(string vendorId, CreateCollectionJobRequest request, string user)
    {
        var vendor = await _vendorRepo.GetByIdAsync(vendorId);
        if (vendor == null) throw new EntityNotFoundException($"Vendor '{vendorId}' not found.");

        var jobId = $"COL-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(1000, 9999)}";
        var entity = new VendorCollectionJob
        {
            VendorCollectionJobId = jobId,
            JobReference = jobId,
            VendorId = vendorId,
            SchoolId = "SCH-004", // Default Uttara Model
            BusinessDate = request.BusinessDate,
            Status = "STARTING",
            StartedAt = DateTimeOffset.UtcNow,
            CreatedBy = user
        };

        var created = await _jobRepo.CreateAsync(entity);

        await _jobRepo.AddEventAsync(new VendorCollectionEvent
        {
            VendorCollectionEventId = $"EVT-{Guid.NewGuid():N}",
            VendorCollectionJobId = jobId,
            SequenceNo = 1,
            EventType = "JOB_STARTED",
            Stage = "STARTING",
            Message = $"Job {jobId} created and initialized.",
            OccurredAt = DateTimeOffset.UtcNow,
            IsError = false
        });

        return new CollectionJobDto
        {
            Id = created.VendorCollectionJobId,
            JobReference = created.JobReference,
            VendorId = created.VendorId,
            VendorName = vendor.VendorName,
            SchoolId = created.SchoolId,
            SchoolName = request.SchoolName,
            BusinessDate = created.BusinessDate,
            Status = created.Status,
            StartedAt = created.StartedAt.ToString("HH:mm:ss"),
            Events = new List<CollectionEventDto>
            {
                new() { Timestamp = DateTime.UtcNow.ToString("HH:mm:ss"), Message = $"Job {jobId} queued." }
            }
        };
    }

    public async Task<CollectionJobDto?> GetJobAsync(string jobId)
    {
        var job = await _jobRepo.GetByIdAsync(jobId);
        if (job == null) return null;

        var events = await _jobRepo.GetEventsByJobAsync(jobId);
        ArtifactDto? artifactDto = null;
        if (!string.IsNullOrWhiteSpace(job.ArtifactId))
        {
            var art = await _artifactRepo.GetByIdAsync(job.ArtifactId);
            if (art != null)
            {
                artifactDto = new ArtifactDto
                {
                    Id = art.VendorArtifactId,
                    VendorId = art.VendorId,
                    SchoolId = art.SchoolId,
                    BusinessDate = art.BusinessDate,
                    FileName = art.OriginalFilename,
                    FileType = "XLSX",
                    FileSize = $"{art.FileSizeBytes / 1024.0:F1} KB",
                    RowCount = art.RowCount,
                    TotalAmount = art.TotalAmount,
                    Sha256 = art.Sha256,
                    CollectedAt = art.CreatedAt.ToString("dd MMM yyyy HH:mm:ss"),
                    Status = "Valid"
                };
            }
        }

        return new CollectionJobDto
        {
            Id = job.VendorCollectionJobId,
            JobReference = job.JobReference,
            VendorId = job.VendorId,
            SchoolId = job.SchoolId,
            BusinessDate = job.BusinessDate,
            Status = job.Status,
            StartedAt = job.StartedAt.ToString("HH:mm:ss"),
            CompletedAt = job.CompletedAt?.ToString("HH:mm:ss"),
            Artifact = artifactDto,
            Events = events.Select(e => new CollectionEventDto
            {
                Timestamp = e.OccurredAt.ToString("HH:mm:ss"),
                Message = e.Message,
                IsError = e.IsError,
                IsSuccess = !e.IsError
            }).ToList()
        };
    }

    public async Task<IEnumerable<CollectionEventDto>> GetEventsAsync(string jobId)
    {
        var events = await _jobRepo.GetEventsByJobAsync(jobId);
        return events.Select(e => new CollectionEventDto
        {
            Timestamp = e.OccurredAt.ToString("HH:mm:ss"),
            Message = e.Message,
            IsError = e.IsError,
            IsSuccess = !e.IsError
        });
    }

    public async Task<ArtifactDto?> GetArtifactAsync(string artifactId)
    {
        var art = await _artifactRepo.GetByIdAsync(artifactId);
        if (art == null) return null;

        return new ArtifactDto
        {
            Id = art.VendorArtifactId,
            VendorId = art.VendorId,
            SchoolId = art.SchoolId,
            BusinessDate = art.BusinessDate,
            FileName = art.OriginalFilename,
            FileType = "XLSX",
            FileSize = $"{art.FileSizeBytes / 1024.0:F1} KB",
            RowCount = art.RowCount,
            TotalAmount = art.TotalAmount,
            Sha256 = art.Sha256,
            CollectedAt = art.CreatedAt.ToString("dd MMM yyyy HH:mm:ss"),
            Status = "Valid"
        };
    }
}