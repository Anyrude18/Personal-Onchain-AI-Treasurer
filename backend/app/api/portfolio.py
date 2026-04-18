from fastapi import APIRouter
from app.services.portfolio_service import fetch_portfolio
from app.models.portfolio_model import PortfolioResponse

router = APIRouter()

@router.get("/portfolio/{wallet_address}", response_model=PortfolioResponse)
def get_portfolio(wallet_address: str):
    return fetch_portfolio(wallet_address)