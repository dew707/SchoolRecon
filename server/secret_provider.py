import abc
import os
from datetime import datetime, timezone


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
    """
    Development-only provider.

    Credential values are supplied through process environment variables.
    No credential values are stored in source code and there is no fallback
    credential for unknown secret references.
    """

    _ENV_MAPPING = {
        "vault://transbingo/demo/operator": (
            "SCHOOLRECON_TRANSBINGO_DEMO_USERNAME",
            "SCHOOLRECON_TRANSBINGO_DEMO_PASSWORD",
        ),
        "vault://transbingo/prod/svc_recon": (
            "SCHOOLRECON_TRANSBINGO_PROD_USERNAME",
            "SCHOOLRECON_TRANSBINGO_PROD_PASSWORD",
        ),
        "vault://edupay/prod/api_key_v2": (
            "SCHOOLRECON_EDUPAY_USERNAME",
            "SCHOOLRECON_EDUPAY_SECRET",
        ),
        "vault://schoolsoft/prod/operator": (
            "SCHOOLRECON_SCHOOLSOFT_USERNAME",
            "SCHOOLRECON_SCHOOLSOFT_PASSWORD",
        ),
    }

    def __init__(self):
        self._runtime_store = {}

    def get_credential(self, secret_ref: str) -> dict:
        if secret_ref in self._runtime_store:
            return self._runtime_store[secret_ref]

        mapping = self._ENV_MAPPING.get(secret_ref)

        if mapping is None:
            raise KeyError(
                f"Unknown credential reference: {secret_ref}"
            )

        username_env, secret_env = mapping

        username = os.getenv(username_env)
        secret = os.getenv(secret_env)

        if not username or not secret:
            raise RuntimeError(
                f"Credential '{secret_ref}' is configured but its "
                "environment values are missing."
            )

        return {
            "username": username,
            "password": secret,
        }

    def has_credential(self, secret_ref: str) -> bool:
        if secret_ref in self._runtime_store:
            return True

        mapping = self._ENV_MAPPING.get(secret_ref)

        if mapping is None:
            return False

        username_env, secret_env = mapping

        return bool(
            os.getenv(username_env)
            and os.getenv(secret_env)
        )

    def store_credential(
        self,
        secret_ref: str,
        username: str,
        secret: str,
    ):
        if not secret_ref or not username or not secret:
            raise ValueError(
                "secret_ref, username and secret are required."
            )

        self._runtime_store[secret_ref] = {
            "username": username,
            "password": secret,
            "last_rotated": datetime.now(timezone.utc).isoformat(),
        }


secret_provider = DevelopmentSecretProvider()