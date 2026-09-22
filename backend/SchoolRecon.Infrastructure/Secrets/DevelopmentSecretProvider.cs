using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using SchoolRecon.Application.Interfaces;

namespace SchoolRecon.Infrastructure.Secrets;

public class DevelopmentSecretProvider : ISecretProvider
{
    private readonly ConcurrentDictionary<string, (string Username, string Password)> _runtimeStore = new();

    private static readonly IReadOnlyDictionary<string, (string UsernameEnv, string SecretEnv)> EnvironmentMappings =
        new Dictionary<string, (string UsernameEnv, string SecretEnv)>
        {
            ["vault://transbingo/demo/operator"] =
                ("SCHOOLRECON_TRANSBINGO_DEMO_USERNAME", "SCHOOLRECON_TRANSBINGO_DEMO_PASSWORD"),

            ["vault://transbingo/prod/svc_recon"] =
                ("SCHOOLRECON_TRANSBINGO_PROD_USERNAME", "SCHOOLRECON_TRANSBINGO_PROD_PASSWORD"),

            ["vault://edupay/prod/api_key_v2"] =
                ("SCHOOLRECON_EDUPAY_USERNAME", "SCHOOLRECON_EDUPAY_SECRET"),

            ["vault://schoolsoft/prod/operator"] =
                ("SCHOOLRECON_SCHOOLSOFT_USERNAME", "SCHOOLRECON_SCHOOLSOFT_PASSWORD")
        };

    public Task<(string Username, string Password)> ResolveCredentialAsync(string secretReference)
    {
        if (string.IsNullOrWhiteSpace(secretReference))
            throw new ArgumentException("Secret reference is required.", nameof(secretReference));

        if (_runtimeStore.TryGetValue(secretReference, out var runtimeCredential))
            return Task.FromResult(runtimeCredential);

        if (!EnvironmentMappings.TryGetValue(secretReference, out var mapping))
            throw new InvalidOperationException(
                $"Unknown credential reference: {secretReference}");

        var username = Environment.GetEnvironmentVariable(mapping.UsernameEnv);
        var password = Environment.GetEnvironmentVariable(mapping.SecretEnv);

        if (string.IsNullOrWhiteSpace(username) ||
            string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException(
                $"Credential '{secretReference}' is configured but its environment values are missing.");
        }

        return Task.FromResult((username, password));
    }

    public Task<bool> HasCredentialAsync(string secretReference)
    {
        if (string.IsNullOrWhiteSpace(secretReference))
            return Task.FromResult(false);

        if (_runtimeStore.ContainsKey(secretReference))
            return Task.FromResult(true);

        if (!EnvironmentMappings.TryGetValue(secretReference, out var mapping))
            return Task.FromResult(false);

        var username = Environment.GetEnvironmentVariable(mapping.UsernameEnv);
        var password = Environment.GetEnvironmentVariable(mapping.SecretEnv);

        return Task.FromResult(
            !string.IsNullOrWhiteSpace(username) &&
            !string.IsNullOrWhiteSpace(password));
    }
}