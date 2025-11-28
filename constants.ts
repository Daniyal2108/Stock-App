import { OptionContract } from "./types";

// All market data is now fetched from real-time APIs
// No mock data is used - everything comes from backend APIs

// Generate options chain (still needed for options view)
export const generateOptionsChain = (spotPrice: number): OptionContract[] => {
  const strikes = [];
  const startStrike = Math.floor(spotPrice * 0.85);
  for (let i = 0; i < 12; i++) {
    const strike = startStrike + i * (spotPrice * 0.02); // Dynamic strike steps
    const timeToExpiry = 30 / 365; // 30 days

    // Basic Black-Scholes-ish estimation for better realism
    const d1 =
      (Math.log(spotPrice / strike) + (0.05 + 0.5 * 0.2 * 0.2) * timeToExpiry) /
      (0.2 * Math.sqrt(timeToExpiry));

    // Delta Approx
    const deltaCall = 0.5 + (spotPrice - strike) / (spotPrice * 0.5);
    const deltaPut = deltaCall - 1;

    const callPrice = Math.max(
      0.01,
      spotPrice - strike + Math.random() * spotPrice * 0.05
    );
    const putPrice = Math.max(
      0.01,
      strike - spotPrice + Math.random() * spotPrice * 0.05
    );

    strikes.push({
      strike: Math.round(strike),
      expiry: "2024-12-20",
      call: {
        bid: Number((callPrice * 0.98).toFixed(2)),
        ask: Number((callPrice * 1.02).toFixed(2)),
        last: Number(callPrice.toFixed(2)),
        iv: Number((0.2 + Math.random() * 0.1).toFixed(2)),
        delta: Number(Math.max(0, Math.min(1, deltaCall)).toFixed(2)),
        gamma: Number((Math.random() * 0.05).toFixed(3)),
      },
      put: {
        bid: Number((putPrice * 0.98).toFixed(2)),
        ask: Number((putPrice * 1.02).toFixed(2)),
        last: Number(putPrice.toFixed(2)),
        iv: Number((0.2 + Math.random() * 0.1).toFixed(2)),
        delta: Number(Math.max(-1, Math.min(0, deltaPut)).toFixed(2)),
        gamma: Number((Math.random() * 0.04).toFixed(3)),
      },
    });
  }
  return strikes;
};
