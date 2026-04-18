from pydantic import BaseModel
from typing import List

class Expense(BaseModel):
    category: str
    amount: float

class BudgetRequest(BaseModel):
    wallet: str
    expenses: List[Expense]

class BudgetResponse(BaseModel):
    wallet: str
    total_spent: float
    breakdown: List[Expense]