import os
import json
import base64
import hmac
import hashlib
import time
from typing import Dict, Any, Optional

from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent

try:
    from dotenv import load_dotenv
    # Explicitly load from backend/.env first, then fallback to current working directory .env
    env_backend_path = BACKEND_DIR / ".env"
    if env_backend_path.exists():
        load_dotenv(dotenv_path=env_backend_path)
    else:
        load_dotenv()
except ImportError:
    pass

def get_jwt_secret() -> str:
    """
    Requires JWT_SECRET from environment configuration (.env).
    Raises clear configuration RuntimeError if JWT_SECRET is missing.
    """
    secret = os.getenv("JWT_SECRET")
    if not secret or not secret.strip():
        raise RuntimeError(
            "Configuration Error: JWT_SECRET environment variable is missing. "
            "Please configure JWT_SECRET in backend/.env before authenticating."
        )
    return secret.strip()


def hash_password(password: str, salt: Optional[bytes] = None) -> str:
    """
    Hashes a plain-text password using PBKDF2-HMAC-SHA256.
    Returns format: pbkdf2_sha256$<salt_hex>$<hash_hex>
    """
    if salt is None:
        salt = os.urandom(16)
    iterations = 100_000
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, iterations)
    return f"pbkdf2_sha256${salt.hex()}${key.hex()}"

def verify_password(plain_password: str, stored_hash: str) -> bool:
    """
    Verifies a plain-text password against a stored PBKDF2-HMAC-SHA256 hash.
    """
    if not stored_hash or not stored_hash.startswith("pbkdf2_sha256$"):
        return False
    try:
        parts = stored_hash.split("$")
        if len(parts) != 3:
            return False
        salt = bytes.fromhex(parts[1])
        expected_key = parts[2]
        computed_hash = hash_password(plain_password, salt)
        computed_key = computed_hash.split("$")[2]
        return hmac.compare_digest(expected_key, computed_key)
    except Exception:
        return False

def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def _b64decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode((data + padding).encode('utf-8'))

def create_jwt_token(payload: Dict[str, Any], expires_in_seconds: int = 86400) -> str:
    """
    Creates a signed HS256 JWT token using JWT_SECRET from environment.
    """
    secret = get_jwt_secret()
    header = {"alg": "HS256", "typ": "JWT"}
    
    payload_copy = dict(payload)
    now = int(time.time())
    payload_copy["iat"] = now
    payload_copy["exp"] = now + expires_in_seconds

    header_b64 = _b64encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    payload_b64 = _b64encode(json.dumps(payload_copy, separators=(',', ':')).encode('utf-8'))
    
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    signature = hmac.new(secret.encode('utf-8'), signing_input, hashlib.sha256).digest()
    signature_b64 = _b64encode(signature)

    return f"{header_b64}.{payload_b64}.{signature_b64}"

def decode_jwt_token(token: str) -> Dict[str, Any]:
    """
    Decodes and verifies an HS256 JWT token using JWT_SECRET from environment.
    Raises ValueError on invalid signature or expiration.
    """
    secret = get_jwt_secret()
    parts = token.split('.')
    if len(parts) != 3:
        raise ValueError("Invalid token format")
    
    header_b64, payload_b64, signature_b64 = parts
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    
    expected_sig = hmac.new(secret.encode('utf-8'), signing_input, hashlib.sha256).digest()
    actual_sig = _b64decode(signature_b64)
    
    if not hmac.compare_digest(expected_sig, actual_sig):
        raise ValueError("Invalid token signature")
    
    payload_bytes = _b64decode(payload_b64)
    payload = json.loads(payload_bytes.decode('utf-8'))
    
    now = int(time.time())
    if "exp" in payload and payload["exp"] < now:
        raise ValueError("Token has expired")
    
    return payload
