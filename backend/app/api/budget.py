from fastapi import APIRouter
from app.models.budget_model import BudgetRequest, BudgetResponse
from app.services.budget_service import add_budget, get_budget

router = APIRouter()

@router.post("/budget/add")
def add_budget_data(data: BudgetRequest):
    expenses = [expense.dict() for expense in data.expenses]
    add_budget(data.wallet, expenses)
    return {"message": "Expenses added successfully"}

@router.get("/budget/{wallet}", response_model=BudgetResponse)
def get_budget_data(wallet: str):
    return get_budget(wallet)