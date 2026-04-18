from fastapi import APIRouter
from app.services.portfolio_service import fetch_portfolio
from app.services.ai_service import generate_recommendations
from app.models.portfolio_model import PortfolioResponse
from app.models.ai_model import AIResponse

# ✅ CREATE ROUTER FIRST
router = APIRouter()

@router.get(
    "/ai/recommend/{wallet_address}",
    response_model=AIResponse,
    response_model_exclude_none=True   # 🔥 IMPORTANT
)
def ai_recommend(wallet_address: str):
    # Step 1: fetch portfolio
    portfolio_data = fetch_portfolio(wallet_address)

    # Step 2: convert to model
    portfolio = PortfolioResponse(**portfolio_data)

    # Step 3: generate AI output
    recommendations = generate_recommendations(portfolio)

    # Remove null values
    return {
    "wallet": wallet_address,
    "recommendations": recommendations   # ✅ correct
}