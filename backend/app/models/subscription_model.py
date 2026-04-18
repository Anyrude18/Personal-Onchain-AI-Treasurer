from pydantic import BaseModel
from typing import List

class Subscription(BaseModel):
    name: str
    amount: float
    frequency: str   # monthly / weekly

class SubscriptionRequest(BaseModel):
    wallet: str
    subscriptions: List[Subscription]

class SubscriptionResponse(BaseModel):
    wallet: str
    subscriptions: List[Subscription]