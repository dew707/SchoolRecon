using System;
using System.Collections.Generic;
using System.Linq;
using SchoolRecon.Application.DTOs;
using SchoolRecon.Domain.Exceptions;

namespace SchoolRecon.Application.Validators;

public static class ConfigurationValidator
{
    private static readonly HashSet<string> AllowedActions = new(StringComparer.OrdinalIgnoreCase)
    {
        "NAVIGATE", "FILL", "CLICK", "WAIT_FOR", "SELECT", "SET_DATE", "SEARCH", "DOWNLOAD"
    };

    private static readonly HashSet<string> AllowedStrategies = new(StringComparer.OrdinalIgnoreCase)
    {
        "data-testid", "id", "name", "css", "text", "role"
    };

    public static void ValidateConnector(VendorConnectorDto connector)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(connector.LoginUrl))
            errors.Add("LoginUrl is required.");
        else if (!Uri.TryCreate(connector.LoginUrl, UriKind.Absolute, out _) && !connector.LoginUrl.StartsWith("/"))
            errors.Add("LoginUrl must be a valid URL or path.");

        if (connector.DefaultTimeoutSeconds <= 0)
            errors.Add("DefaultTimeoutSeconds must be greater than 0.");

        if (connector.MaxRetryCount < 0)
            errors.Add("MaxRetryCount cannot be negative.");

        if (errors.Count > 0)
            throw new DomainValidationException(errors);
    }

    public static void ValidateNavigationSteps(List<NavigationStepDto> steps)
    {
        var errors = new List<string>();

        if (steps == null || steps.Count == 0)
        {
            errors.Add("At least one navigation step is required.");
            throw new DomainValidationException(errors);
        }

        var duplicateSequences = steps.GroupBy(s => s.Sequence).Where(g => g.Count() > 1).Select(g => g.Key).ToList();
        if (duplicateSequences.Any())
            errors.Add($"Duplicate step sequence numbers found: {string.Join(", ", duplicateSequences)}.");

        for (int i = 0; i < steps.Count; i++)
        {
            var s = steps[i];
            if (!AllowedActions.Contains(s.Action))
                errors.Add($"Step {s.Sequence}: Unknown action type '{s.Action}'.");

            if (!AllowedStrategies.Contains(s.SelectorStrategy))
                errors.Add($"Step {s.Sequence}: Unknown selector strategy '{s.SelectorStrategy}'.");

            if (string.IsNullOrWhiteSpace(s.Selector))
                errors.Add($"Step {s.Sequence}: Selector value cannot be empty.");

            if (s.TimeoutMs <= 0)
                errors.Add($"Step {s.Sequence}: Timeout must be positive.");

            if (s.RetryCount < 0)
                errors.Add($"Step {s.Sequence}: RetryCount cannot be negative.");
        }

        if (errors.Count > 0)
            throw new DomainValidationException(errors);
    }

    public static void ValidateReportDefinition(ReportDefinitionDto def)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(def.ReportName))
            errors.Add("ReportName cannot be empty.");

        if (string.IsNullOrWhiteSpace(def.DateFormat))
            errors.Add("DateFormat cannot be empty.");

        if (def.DownloadTimeoutSec <= 0)
            errors.Add("DownloadTimeoutSec must be greater than 0.");

        if (errors.Count > 0)
            throw new DomainValidationException(errors);
    }
}