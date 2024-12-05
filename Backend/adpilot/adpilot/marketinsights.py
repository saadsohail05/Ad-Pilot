import http.client
import json

def query_serper(query):
    conn = http.client.HTTPSConnection("google.serper.dev")
    payload = json.dumps({"q": query})
    headers = {
        'X-API-KEY': '9722f549f78e6603e540f90667ba3c62760c44b2',
        'Content-Type': 'application/json'
    }
    conn.request("POST", "/search", payload, headers)
    res = conn.getresponse()
    return res.read().decode("utf-8")

def get_market_insights(product, category, description):
    query = f"Market trends for {product} in {category} category with description: {description}"
    return query_serper(query)

def get_competitor_analysis(product, category, description):
    query = f"Competitors for {product} in {category} category with description: {description}"
    return query_serper(query)

def extract_insights(data, insight_type):
    try:
        response_data = json.loads(data)
        insights = []
        
        if "organic" in response_data:
            # Extract key market statistics and trends
            market_stats = []
            for result in response_data["organic"]:
                snippet = result.get("snippet", "")
                # Look for market size, CAGR, and value information
                if any(keyword in snippet.lower() for keyword in ["market size", "billion", "cagr", "growth", "valued"]):
                    market_stats.append(snippet)
            
            if market_stats:
                insights.append("Market Statistics:")
                insights.extend(market_stats[:3])  # Keep top 3 most relevant stats
        
        if "peopleAlsoAsk" in response_data:
            insights.append("\nKey Industry Insights:")
            for question in response_data["peopleAlsoAsk"]:
                answer = question.get("snippet", "")
                # Filter only relevant answers
                if any(keyword in answer.lower() for keyword in ["trend", "market", "industry", "growth", "technology"]):
                    insights.append(f"- {answer}")
        
        if "relatedSearches" in response_data:
            insights.append("\nTrending Topics:")
            trends = [
                search.get("query") for search in response_data["relatedSearches"]
                if any(keyword in search.get("query", "").lower() for keyword in ["trend", "market", "industry", "2024"])
            ]
            insights.extend([f"- {trend}" for trend in trends[:5]])  # Keep top 5 relevant trends
        
        formatted_insights = "\n".join(insights)
        return f"{insight_type}:\n{formatted_insights}" if formatted_insights else "No relevant insights found."
    
    except json.JSONDecodeError:
        return f"{insight_type}: Error processing market data."

def analyze_data(product, category, description):
    market_data = get_market_insights(product, category, description)
    market_insights = extract_insights(market_data, "Market Insights")
    
    competitor_data = get_competitor_analysis(product, category, description)
    competitor_analysis = extract_insights(competitor_data, "Competitor Analysis")
    
    return market_insights, competitor_analysis