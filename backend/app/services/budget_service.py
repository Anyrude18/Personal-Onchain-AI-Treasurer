# simple in-memory storage
budget_db = {}

def add_budget(wallet: str, expenses: list):
    if wallet not in budget_db:
        budget_db[wallet] = []

    budget_db[wallet].extend(expenses)

    return budget_db[wallet]


def get_budget(wallet: str):
    expenses = budget_db.get(wallet, [])

    total = sum(exp["amount"] for exp in expenses)

    return {
        "wallet": wallet,
        "total_spent": total,
        "breakdown": expenses
    }
    