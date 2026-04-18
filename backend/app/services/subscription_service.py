subscription_db = {}

def add_subscription(wallet: str, subs: list):
    if wallet not in subscription_db:
        subscription_db[wallet] = []

    subscription_db[wallet].extend(subs)

    return subscription_db[wallet]


def get_subscriptions(wallet: str):
    return {
        "wallet": wallet,
        "subscriptions": subscription_db.get(wallet, [])
    }


def process_payments(wallet: str):
    subs = subscription_db.get(wallet, [])

    total = sum(sub["amount"] for sub in subs)

    return {
        "wallet": wallet,
        "total_paid": total,
        "message": "All subscriptions processed (simulated)"
    }