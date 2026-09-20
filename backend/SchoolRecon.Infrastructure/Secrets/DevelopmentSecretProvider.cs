using System.Collections.Concurrent;
using System.Threading.Tasks;
using SchoolRecon.Application.Interfaces;

namespace SchoolRecon.Infrastructure.Secrets;

public class DevelopmentSecretProvider : ISecretProvider
{
    private readonly ConcurrentDictionary<string, (string Username, string Password)> _store = new();

    public DevelopmentSecretProvider()
    {
        _store.TryAdd("vault://transbingo/demo/operator", ("demo-operator", "TransBingoSecure2026!#"));
        _store.TryAdd("vault://transbingo/prod/svc_recon", ("recon_ops_bd@tapgateway.com", "TransBingoProdToken2026$"));
        _store.TryAdd("vault://edupay/prod/api_key_v2", ("api_client_tap_recon", "edupay_live_secret_key_9981"));
        _store.TryAdd("vault://schoolsoft/prod/operator", ("schoolsoft_ops", "SchoolSoft2026!@"));
    }

    public Task<(string Username, string Password)> ResolveCredentialAsync(string secretReference)
    {
        if (_store.TryGetValue(secretReference, out var cred))
            return Task.FromResult(cred);

        return Task.FromResult(("demo-operator", "TransBingoSecure2026!#"));
    }

    public Task<bool> HasCredentialAsync(string secretReference)
    {
        return Task.FromResult(_store.ContainsKey(secretReference));
    }
}