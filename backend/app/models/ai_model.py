from pydantic import BaseModel
from typing import List, Optional

class Recommendation(BaseModel):
    action: str
    from_protocol: Optional[str] = None
    to_protocol: Optional[str] = None
    protocol: Optional[str] = None
    reason: str
    risk: str

class AIResponse(BaseModel):
    wallet: str
    recommendations: List[Recommendation]