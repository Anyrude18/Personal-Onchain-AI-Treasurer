from fastapi import APIRouter
from app.models.subscription_model import SubscriptionRequest, SubscriptionResponse
from app.services.subscription_service import add_subscription, get_subscriptions, process_payments

router = APIRouter()

@router.post("/subscriptions/add")
def add_subscriptions(data: SubscriptionRequest):
    subs = [s.dict() for s in data.subscriptions]
    add_subscription(data.wallet, subs)
    return {"message": "Subscriptions added"}

@router.get("/subscriptions/{wallet}", response_model=SubscriptionResponse)
def fetch_subscriptions(wallet: str):
    return get_subscriptions(wallet)

@router.post("/subscriptions/pay")
def pay_subscriptions(wallet: str):
    return process_payments(wallet)