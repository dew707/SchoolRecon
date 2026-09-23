using SchoolRecon.Application.DTOs;
using SchoolRecon.Application.Validators;
using SchoolRecon.Domain.Exceptions;
using Xunit;

namespace SchoolRecon.Tests;

public class NavigationConfigurationTests
{
    [Fact]
    public void Valid_workflow_accepts_runtime_and_credential_sources()
    {
        var steps = new List<NavigationStepDto>
        {
            Step(1, "OPEN", "NAVIGATE", selector: "/login"),
            Step(2, "USERNAME", "FILL", "CREDENTIAL_USERNAME", selector: "username"),
            Step(3, "SCHOOL", "SELECT", "{{vendorSchoolCode}}", selector: "school")
        };

        ConfigurationValidator.ValidateNavigationSteps(steps);
    }

    [Theory]
    [InlineData("BAD_ACTION", "data-testid", "Unknown action type")]
    [InlineData("CLICK", "placeholder", "Unknown selector strategy")]
    public void Invalid_action_or_selector_is_rejected(string action, string strategy, string expected)
    {
        var step = Step(1, "STEP", action, selector: "target");
        step.SelectorStrategy = strategy;

        var error = Assert.Throws<DomainValidationException>(() => ConfigurationValidator.ValidateNavigationSteps([step]));

        Assert.Contains(expected, error.Message);
    }

    [Fact]
    public void Duplicate_code_and_gapped_sequence_are_rejected()
    {
        var steps = new List<NavigationStepDto>
        {
            Step(1, "SAME", "CLICK", selector: "one"),
            Step(3, "same", "CLICK", selector: "two")
        };

        var error = Assert.Throws<DomainValidationException>(() => ConfigurationValidator.ValidateNavigationSteps(steps));

        Assert.Contains("Duplicate StepCode", error.Message);
        Assert.Contains("contiguous", error.Message);
    }

    [Fact]
    public void Unknown_runtime_variable_is_rejected()
    {
        var step = Step(1, "DATE", "SET_DATE", "{{todayPlusOne}}", selector: "date");

        var error = Assert.Throws<DomainValidationException>(() => ConfigurationValidator.ValidateNavigationSteps([step]));

        Assert.Contains("Runtime variable", error.Message);
    }

    [Fact]
    public void Credential_fill_fails_closed_when_given_a_static_value()
    {
        var step = Step(1, "PASSWORD", "FILL", "STATIC", "not-a-real-secret", "password");

        var error = Assert.Throws<DomainValidationException>(() => ConfigurationValidator.ValidateNavigationSteps([step]));

        Assert.Contains("credential field reference", error.Message, StringComparison.OrdinalIgnoreCase);
    }

    private static NavigationStepDto Step(
        int sequence,
        string code,
        string action,
        string? inputSource = null,
        string? staticValue = null,
        string selector = "target") => new()
    {
        Id = $"STEP-{sequence}",
        Sequence = sequence,
        StepCode = code,
        Action = action,
        SelectorStrategy = "data-testid",
        Selector = selector,
        InputSource = inputSource,
        StaticValue = staticValue,
        Description = code,
        TimeoutMs = 15000,
        RetryCount = 1,
        IsRequired = true,
        IsActive = true
    };
}
