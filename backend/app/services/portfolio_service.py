def fetch_portfolio(wallet_address: str):
    # MOCK DATA
    tokens = [
        {"name": "ETH", "amount": 0.5, "value": 900},
        {"name": "USDT", "amount": 300, "value": 300}
    ]

    defi_positions = [
        {"protocol": "Aave", "value": 300, "apy": 3.5},
        {"protocol": "Compound", "value": 200, "apy": 5.5}
    ]

    total_value = sum(t["value"] for t in tokens) + sum(d["value"] for d in defi_positions)

    return {
        "wallet": wallet_address,
        "total_value": total_value,
        "tokens": tokens,
        "defi_positions": defi_positions
    }