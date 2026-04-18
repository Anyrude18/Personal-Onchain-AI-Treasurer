from pydantic import BaseModel
from typing import List

class Token(BaseModel):
    name: str
    amount: float
    value: float

class DefiPosition(BaseModel):
    protocol: str
    value: float
    apy: float

class PortfolioResponse(BaseModel):
    wallet: str
    total_value: float
    tokens: List[Token]
    defi_positions: List[DefiPosition]