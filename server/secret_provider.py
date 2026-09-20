import abc, os

class SecretProvider(abc.ABC):
    @abc.abstractmethod
    def get_credential(self, secret_ref: str) -> dict:
        pass

    @abc.abstractmethod
    def has_credential(self, secret_ref: str) -> bool:
        pass

    @abc.abstractmethod
    def store_credential(self, secret_ref: str, username: str, secret: str):
        pass

class DevelopmentSecretProvider(SecretProvider):
    def __init__(self):
        self._store = {
            "vault://transbingo/demo/operator": {
                "username": "demo-operator",
                "password": "TransBingoSecure2026!#",
                "last_rotated": "2026-09-18 00:00:00 UTC"
            },
            "vault://transbingo/prod/svc_recon": {
                "username": "recon_ops_bd@tapgateway.com",
                "password": "TransBingoProdToken2026$",
                "last_rotated": "2026-09-18 00:45:00 UTC"
            }
        }

    def get_credential(self, secret_ref: str) -> dict:
        if secret_ref in self._store:
            return self._store[secret_ref]
        return {"username": "demo-operator", "password": "TransBingoSecure2026!#"}

    def has_credential(self, secret_ref: str) -> bool:
        return secret_ref in self._store

    def store_credential(self, secret_ref: str, username: str, secret: str):
        self._store[secret_ref] = {
            "username": username,
            "password": secret,
            "last_rotated": "2026-09-19 12:00:00 UTC"
        }

secret_provider = DevelopmentSecretProvider()
