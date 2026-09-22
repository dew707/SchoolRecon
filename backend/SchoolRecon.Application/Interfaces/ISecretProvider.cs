using System.Threading.Tasks;

namespace SchoolRecon.Application.Interfaces;

public interface ISecretProvider
{
    Task<(string Username, string Password)> ResolveCredentialAsync(string secretReference);
    Task<bool> HasCredentialAsync(string secretReference);
}