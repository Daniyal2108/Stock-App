import { GoogleGenAI } from "@google/genai";
import { MarketData, UserProfile, PortfolioItem } from "../types";

const apiKey = process.env.API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

const MODEL_ID = 'gemini-2.5-flash';

// Helper to format portfolio for AI context
const formatPortfolio = (portfolio: PortfolioItem[]) => {
  if (portfolio.length === 0) return "User has no active positions.";
  return portfolio.map(p => `${p.symbol}: ${p.quantity} units @ $${p.avgPrice.toFixed(2)}`).join(', ');
};

// FALLBACK ALGORITHM (Simulated AI)
// Ensures the app remains functional even if the API Key is invalid or network fails
const generateFallbackAdvisory = (marketData: MarketData, user: UserProfile | null): string => {
    const trend = marketData.changePercent > 0 ? "Bullish" : "Bearish";
    const risk = user?.riskTolerance || "General";
    const action = marketData.changePercent < -2 ? "BUY THE DIP" : (marketData.changePercent > 2 ? "TAKE PROFIT" : "HOLD");
    
    return `**DK Offline Analysis (Simulation Mode)**
    
    **Asset:** ${marketData.symbol}
    **Trend:** ${trend} (${marketData.changePercent.toFixed(2)}%)
    **Rating:** ${action}
    
    **Strategy:**
    The asset is currently showing ${trend.toLowerCase()} momentum. Given your '${risk}' risk profile, ${action === 'BUY THE DIP' ? 'this volatility presents an accumulation opportunity.' : 'maintain current stops and monitor volume.'}
    
    *Note: Live AI connection unavailable. Using algorithmic fallback.*`;
};

export const getMarketAnalysis = async (
  marketData: MarketData, 
  user: UserProfile | null,
  portfolio: PortfolioItem[],
  context: string
): Promise<string> => {
  if (!ai) {
      // Return algorithmic fallback if no API key
      return new Promise(resolve => setTimeout(() => resolve(generateFallbackAdvisory(marketData, user)), 1500));
  }

  try {
    const userContext = user 
      ? `User Profile: ${user.name}, Risk: ${user.riskTolerance}, Goal: ${user.goal}. Current Portfolio: ${formatPortfolio(portfolio)}.` 
      : "User Profile: Guest (General Advice).";

    const prompt = `
      Act as DK, a high-end Personal Financial Advisor.
      
      ${userContext}
      
      Analyze the following asset: ${marketData.symbol} (${marketData.name}).
      Current Price: ${marketData.price}.
      24h Change: ${marketData.changePercent}%.
      Context: ${context}
      
      Provide a generic but sharp advisory summary. 
      1. Key Technical Levels (Support/Resistance).
      2. Does this fit the user's ${user?.riskTolerance || 'General'} risk profile?
      3. Clear Buy/Sell/Hold rating.
      
      Keep it professional, concise (under 100 words), and strictly actionable. Use Markdown formatting.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
    });

    return response.text || generateFallbackAdvisory(marketData, user);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return generateFallbackAdvisory(marketData, user);
  }
};

export const chatWithAnalyst = async (
  history: {role: string, parts: {text: string}[]}[], 
  message: string,
  user: UserProfile | null,
  portfolio: PortfolioItem[]
): Promise<string> => {
    if (!ai) {
        return new Promise(resolve => setTimeout(() => resolve("I am currently operating in offline mode. My live connection to the neural engine is down, but I can still track your portfolio logic locally. Please check your API Key configuration to restore full cognitive abilities."), 1000));
    }

    try {
        const userContext = user 
            ? `USER CONTEXT: Name: ${user.name}. Risk Tolerance: ${user.riskTolerance}. Investment Goal: ${user.goal}. Cash Balance: $${user.balance}. CURRENT HOLDINGS: ${formatPortfolio(portfolio)}.` 
            : `USER CONTEXT: Guest User.`;

        const systemInstruction = `
            You are 'DK', a world-class Personal Financial Advisor and Market Strategist. 
            
            YOUR MISSION:
            To guide the user based specifically on their Risk Tolerance and Goals.
            
            ${userContext}
            
            GUIDELINES:
            1. Always consider the user's current portfolio when answering. If they ask "Should I buy AAPL?", check if they already own it or if they have cash.
            2. If the user is 'Conservative', warn against high-volatility crypto/options. If 'Aggressive', suggest high-growth opportunities.
            3. Be concise, professional, but conversational. Use formatting (bullet points) for clarity.
            4. You can explain complex terms (Greeks, RSI, MACD) simply.
            5. Disclaimer: Always end with a brief "Not financial advice" note if giving specific trade targets.
        `;

        const chat = ai.chats.create({
            model: MODEL_ID,
            history: history,
            config: {
                systemInstruction: systemInstruction
            }
        });

        const result = await chat.sendMessage({ message });
        return result.text || "No response generated.";
    } catch (error) {
        console.error("Chat Error:", error);
        return "I'm having trouble connecting to the advisory servers right now. Please try again in a moment.";
    }
}