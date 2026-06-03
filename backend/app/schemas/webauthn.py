from pydantic import BaseModel

class RegisterCredentialRequest(BaseModel):
    credential_id: str

class RegisterCredentialResponse(BaseModel):
    success: bool
    message: str

class VerifyCredentialRequest(BaseModel):
    credential_id: str

class VerifyCredentialResponse(BaseModel):
    verified: bool
    message: str
