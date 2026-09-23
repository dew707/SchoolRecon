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

    private static readonly HashSet<string> SelectorActions = new(StringComparer.OrdinalIgnoreCase)
    {
        "FILL", "CLICK", "WAIT_FOR", "SELECT", "SET_DATE", "SEARCH", "DOWNLOAD"
    };

    private static readonly HashSet<string> ValueActions = new(StringComparer.OrdinalIgnoreCase)
    {
        "FILL", "SELECT", "SET_DATE"
    };

    private static readonly HashSet<string> RuntimeVariables = new(StringComparer.Ordinal)
    {
        "{{schoolCode}}", "{{vendorSchoolCode}}", "{{businessDate}}", "{{fromDate}}", "{{toDate}}"
    };

    private static readonly HashSet<string> CredentialSources = new(StringComparer.OrdinalIgnoreCase)
    {
        "CREDENTIAL_USERNAME", "CREDENTIAL_PASSWORD"
    };

    private static readonly HashSet<string> AllowedAuthenticationTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "Username + Password", "Username + Password + OTP", "API Key", "Bearer Token"
    };

    private static readonly HashSet<string> AllowedSecretProviders = new(StringComparer.OrdinalIgnoreCase)
    {
        "DevelopmentSecretProvider"
    };

    public static void ValidateConnector(VendorConnectorDto connector)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(connector.LoginUrl))
            errors.Add("LoginUrl is required.");
        else if (!Uri.TryCreate(connector.LoginUrl, UriKind.Absolute, out var loginUri) ||
                 (loginUri.Scheme != Uri.UriSchemeHttp && loginUri.Scheme != Uri.UriSchemeHttps))
            errors.Add("LoginUrl must be a valid absolute HTTP or HTTPS URL.");

        if (connector.DefaultTimeoutSeconds <= 0)
            errors.Add("DefaultTimeoutSeconds must be greater than 0.");

        if (connector.MaxRetryCount < 0)
            errors.Add("MaxRetryCount cannot be negative.");

        if (errors.Count > 0)
            throw new DomainValidationException(errors);
    }

    public static void ValidateCredentialReference(CredentialReferenceDto credential)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(credential.Environment))
            errors.Add("Environment is required.");
        if (string.IsNullOrWhiteSpace(credential.AuthenticationType) ||
            !AllowedAuthenticationTypes.Contains(credential.AuthenticationType))
            errors.Add("AuthenticationType is unsupported.");
        if (string.IsNullOrWhiteSpace(credential.SecretProvider) ||
            !AllowedSecretProviders.Contains(credential.SecretProvider))
            errors.Add("SecretProvider is unsupported.");
        if (string.IsNullOrWhiteSpace(credential.SecretId))
            errors.Add("SecretId is required.");
        if (string.IsNullOrWhiteSpace(credential.VaultPath))
            errors.Add("SecretReference is required.");

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

        var expectedSequences = Enumerable.Range(1, steps.Count);
        if (!steps.Select(s => s.Sequence).OrderBy(x => x).SequenceEqual(expectedSequences))
            errors.Add("Navigation step sequence must be contiguous from 1 through N.");

        var duplicateCodes = steps.Where(s => !string.IsNullOrWhiteSpace(s.StepCode))
            .GroupBy(s => s.StepCode.Trim(), StringComparer.OrdinalIgnoreCase)
            .Where(g => g.Count() > 1).Select(g => g.Key).ToList();
        if (duplicateCodes.Any())
            errors.Add($"Duplicate StepCode values found: {string.Join(", ", duplicateCodes)}.");

        for (int i = 0; i < steps.Count; i++)
        {
            var s = steps[i];
            if (string.IsNullOrWhiteSpace(s.StepCode))
                errors.Add($"Step {s.Sequence}: StepCode is required.");

            if (!AllowedActions.Contains(s.Action))
                errors.Add($"Step {s.Sequence}: Unknown action type '{s.Action}'.");

            if (SelectorActions.Contains(s.Action) && !AllowedStrategies.Contains(s.SelectorStrategy))
                errors.Add($"Step {s.Sequence}: Unknown selector strategy '{s.SelectorStrategy}'.");

            if ((SelectorActions.Contains(s.Action) || s.Action.Equals("NAVIGATE", StringComparison.OrdinalIgnoreCase)) && string.IsNullOrWhiteSpace(s.Selector))
                errors.Add($"Step {s.Sequence}: Selector value cannot be empty.");

            if (s.TimeoutMs < 1000 || s.TimeoutMs > 300000)
                errors.Add($"Step {s.Sequence}: Timeout must be between 1000 and 300000 milliseconds.");

            if (s.RetryCount < 0 || s.RetryCount > 10)
                errors.Add($"Step {s.Sequence}: RetryCount must be between 0 and 10.");

            if (ValueActions.Contains(s.Action))
            {
                if (string.IsNullOrWhiteSpace(s.InputSource))
                    errors.Add($"Step {s.Sequence}: InputSource is required for {s.Action}.");
                else if (s.InputSource.Equals("STATIC", StringComparison.OrdinalIgnoreCase))
                {
                    if (string.IsNullOrWhiteSpace(s.StaticValue))
                        errors.Add($"Step {s.Sequence}: StaticValue is required when InputSource is STATIC.");
                }
                else if (s.InputSource.StartsWith("{{", StringComparison.Ordinal))
                {
                    if (!RuntimeVariables.Contains(s.InputSource))
                        errors.Add($"Step {s.Sequence}: Runtime variable '{s.InputSource}' is not supported.");
                    if (!string.IsNullOrWhiteSpace(s.StaticValue))
                        errors.Add($"Step {s.Sequence}: StaticValue must be empty for a runtime variable.");
                }
                else if (CredentialSources.Contains(s.InputSource))
                {
                    if (!s.Action.Equals("FILL", StringComparison.OrdinalIgnoreCase))
                        errors.Add($"Step {s.Sequence}: Credential fields may only be used by FILL actions.");
                    if (!string.IsNullOrWhiteSpace(s.StaticValue))
                        errors.Add($"Step {s.Sequence}: Credential field references cannot include a value.");
                }
                else
                    errors.Add($"Step {s.Sequence}: InputSource '{s.InputSource}' is not supported.");

                var identity = $"{s.StepCode} {s.Description} {s.Selector}";
                if (s.Action.Equals("FILL", StringComparison.OrdinalIgnoreCase) &&
                    (identity.Contains("password", StringComparison.OrdinalIgnoreCase) || identity.Contains("username", StringComparison.OrdinalIgnoreCase)) &&
                    !CredentialSources.Contains(s.InputSource ?? string.Empty))
                    errors.Add($"Step {s.Sequence}: Credential-related FILL steps must use a credential field reference.");
            }
            else if (!string.IsNullOrWhiteSpace(s.InputSource) || !string.IsNullOrWhiteSpace(s.StaticValue))
                errors.Add($"Step {s.Sequence}: {s.Action} does not accept a value binding.");
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
