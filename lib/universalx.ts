// lib/universalx.ts

// ... (Imports and Interfaces remain the same) ...

const RPC_URL = "https://universal-rpc-staging.particle.network/";
const ACTIVITY_API = "https://universal-app-api-staging.particle.network/user_activity";

interface Transaction {
  transactionId: string;
  tag: string; // 'buy' or 'sell'
  createdAt: string;
  targetToken: {
    name: string;
    symbol: string;
    image: string;
    price: number;
    decimals: number;
  };
  change: {
    amountInUSD: string;
    netAmountInUSD: string;
  };
}

interface ActivityResponse {
  tradeAnalysis: {
    tradingVolume: number;
    lastTradeAt: string;
  };
}

export class UniversalXService {
  static async fetchUserActivity(evmAddress: string) {
    try {
      const res = await fetch(`${ACTIVITY_API}?evmAddress=${evmAddress}`, {
        next: { revalidate: 3600 } 
      });
      const json: ActivityResponse = await res.json();
      return json;
    } catch (e) {
      console.error("Activity API Error:", e);
      return null;
    }
  }

  static async fetchTransactions(walletAddress: string) {
    let allTransactions: Transaction[] = [];
    const MAX_PAGES = 3; 

    for (let page = 1; page <= MAX_PAGES; page++) {
      const payload = {
        id: Date.now(),
        method: "universal_getTransactionsV2",
        params: [{ sender: walletAddress }, { limit: 50, page: page }],
        jsonrpc: "2.0",
        token: "wbU3Vibvz0hXEPlghTTew0wYaJPh90suRBLFcLCg",
        deviceId: "ce596d96-72af-447a-bd0c-fe84c503ff41"
      };

      try {
        const res = await fetch(RPC_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          next: { revalidate: 3600 }
        });

        const json = await res.json();
        if (json.result?.data) {
          allTransactions.push(...json.result.data);
          if (!json.result.hasNextPage) break;
        } else {
          break;
        }
      } catch (e) {
        break;
      }
    }
    return allTransactions;
  }

  static async getTraderData(address: string) {
    const activity = await this.fetchUserActivity(address);
    const transactions = await this.fetchTransactions(address);

    const dailyMap = new Map<string, number>();
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    let volume30d = 0; // NEW: Track 30d sum specifically

    transactions.forEach(tx => {
        const date = new Date(tx.createdAt);
        if (date >= thirtyDaysAgo) {
            const key = date.toISOString().split('T')[0];
            const vol = Math.abs(parseFloat(tx.change.amountInUSD || "0"));
            
            // Add to map for calendar
            dailyMap.set(key, (dailyMap.get(key) || 0) + vol);
            
            // Add to 30d Total
            volume30d += vol;
        }
    });

    const calendarData = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        calendarData.push({
            date: key,
            dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNum: d.getDate(),
            volume: dailyMap.get(key) || 0
        });
    }

    const recentTrades = transactions.slice(0, 10).map(tx => ({
        token: tx.targetToken?.symbol || "Unknown",
        type: tx.tag === 'buy' ? 'Buy' : 'Sell',
        size: `$${Math.abs(parseFloat(tx.change.amountInUSD)).toFixed(2)}`,
        time: new Date(tx.createdAt),
        image: tx.targetToken?.image
    }));

    return {
        totalVolume: activity?.tradeAnalysis?.tradingVolume || 0, // All Time
        volume30d: volume30d, // NEW: Real 30 Day Volume
        lastActive: activity?.tradeAnalysis?.lastTradeAt ? new Date(activity.tradeAnalysis.lastTradeAt) : new Date(),
        calendarData,
        recentTrades
    };
  }
}