from app.models.portfolio_model import PortfolioResponse

def generate_recommendations(portfolio: PortfolioResponse):
    recommendations = []

    for asset in portfolio.defi_positions:
        if asset.apy < 4:
            recommendations.append({
                "action": "move_funds",
                "from_protocol": asset.protocol,
                "to_protocol": "Lido",
                "reason": f"{asset.protocol} APY ({asset.apy}%) is low. Better yield available.",
                "risk": "low"
            })
        else:
            recommendations.append({
                "action": "hold",
                "protocol": asset.protocol,
                "reason": f"{asset.protocol} APY ({asset.apy}%) is good.",
                "risk": "low"
            })

    return recommendations