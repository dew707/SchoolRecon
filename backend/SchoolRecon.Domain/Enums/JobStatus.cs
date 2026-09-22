namespace SchoolRecon.Domain.Enums;

public enum JobStatus
{
    QUEUED,
    STARTING,
    AUTHENTICATING,
    NAVIGATING,
    GENERATING_REPORT,
    DOWNLOADING,
    VALIDATING,
    STORING,
    COMPLETED,
    FAILED,
    NEEDS_ATTENTION
}