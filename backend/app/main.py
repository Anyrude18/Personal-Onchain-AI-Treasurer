from fastapi import FastAPI
from app.api.portfolio import router as portfolio_router
from app.api.ai import router as ai_router
from app.api.budget import router as budget_router
from app.api.subscription import router as subscription_router

app = FastAPI()

app.include_router(portfolio_router)
app.include_router(ai_router)
app.include_router(budget_router)
app.include_router(subscription_router)

@app.get("/")
def home():
    return {"message": "Backend running 🚀"}