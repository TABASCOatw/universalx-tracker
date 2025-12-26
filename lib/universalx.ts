// lib/universalx.ts

const RPC_URL = "https://universal-rpc-staging.particle.network/";
const ACTIVITY_API = "https://universal-app-api-staging.particle.network/user_activity";

// --- NEW: COVALENT CONFIG ---
const COVALENT_API_KEY = process.env.COVALENT_API_KEY || "cqt_rQvR7qJTDhXP7h9PrJyv6Xgg8qjv"; // <--- REPLACE THIS
const COVALENT_BASE_URL = "https://api.covalenthq.com/v1";

interface Transaction {
  transactionId: string;
  tag: string; 
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

interface InviteAnalysis {
  overview: {
    inviteCode: string;
    totalInviteRewards: number; 
    totalInviteeCount: number;
    validInviteeCount: number;
  };
  allTierInviteeAnalysis: {
    tradeVolume: number;
    tradeFee: number;
    cashRewards: number;
  };
  last30dStats: Array<{
    date: string;
    commission: number;
    tier1InviterTradeVolume: number;
  }>;
}

interface ActivityResponse {
  basicInfo: {
      evmAddress: string;
      solanaAddress: string;
  };
  tradeAnalysis: {
    tradingVolume: number;
    lastTradeAt: string;
  };
  inviteAnalysis?: InviteAnalysis; 
}

// NEW: Asset Interface
export interface Asset {
    chain: 'ETH' | 'BASE' | 'BNB' | 'SOL';
    name: string;
    symbol: string;
    balance: string;
    value: number;
    logo: string;
}

export class UniversalXService {
  static async fetchUserActivity(address: string) {
    try {
      // 1. Trim and detect address type
      const cleanAddress = address.trim();
      const isEvm = cleanAddress.startsWith('0x');
      const queryParam = isEvm ? `evmAddress=${cleanAddress}` : `solanaAddress=${cleanAddress}`;

      console.log(`[UniversalX] Fetching activity for: ${cleanAddress} (${queryParam})`);

      // 2. Fetch with no-store to prevent caching old/empty results during dev
      const res = await fetch(`${ACTIVITY_API}?${queryParam}`, {
        cache: 'no-store' 
      });

      if (!res.ok) {
        console.error(`[UniversalX] Activity API failed: ${res.status}`);
        return null;
      }

      const json = await res.json();
      // Debug log to check the structure returned by the API
      // console.log("[UniversalX] API Response:", JSON.stringify(json, null, 2)); 
      return json;
    } catch (e) {
      console.error("[UniversalX] Activity API Error:", e);
      return null;
    }
  }

  static async fetchTransactions(walletAddress: string) {
    if (!walletAddress) return [];
    
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

  // --- NEW: FETCH ASSETS FROM COVALENT ---
  static async fetchChainAssets(chainName: string, address: string, chainLabel: 'ETH' | 'BASE' | 'BNB' | 'SOL'): Promise<Asset[]> {
      if (!address) return [];
      try {
          const url = `${COVALENT_BASE_URL}/${chainName}/address/${address}/balances_v2/?key=${COVALENT_API_KEY}`;
          const res = await fetch(url);
          const data = await res.json();
          
          if (!data.data || !data.data.items) return [];

          return data.data.items
              .filter((item: any) => item.quote >= 20) // Filter > $20
              .map((item: any) => ({
                  chain: chainLabel,
                  name: item.contract_name || item.contract_ticker_symbol,
                  symbol: item.contract_ticker_symbol,
                  balance: (parseInt(item.balance) / Math.pow(10, item.contract_decimals)).toLocaleString(undefined, { maximumFractionDigits: 4 }),
                  value: item.quote,
                  logo: item.logo_url
              }));
      } catch (e) {
          // Suppress errors for clean logs, or enable for debugging
          // console.error(`Error fetching ${chainLabel} assets:`, e);
          return [];
      }
  }

  static async getTraderData(address: string) {
    const cleanAddress = address.trim();
    const activity = await this.fetchUserActivity(cleanAddress);

    // 3. Resolve EVM Address robustly
    // We check both camelCase (interface) and snake_case (potential API raw)
    const basicInfo = (activity as any)?.basicInfo || (activity as any)?.basic_info;
    
    // Attempt to get EVM address from API response
    let apiEvmAddress = basicInfo?.evmAddress || basicInfo?.evm_address;

    // Fallback: If input was already EVM (starts with 0x), use it.
    // If input was Solana and API failed to return EVM, we can't fetch txs.
    const resolvedEvmAddress = apiEvmAddress || (cleanAddress.startsWith('0x') ? cleanAddress : "");
    const resolvedSolAddress = basicInfo?.solanaAddress || basicInfo?.solana_address || (!cleanAddress.startsWith('0x') ? cleanAddress : "");

    console.log(`[UniversalX] Resolved Addresses -> EVM: ${resolvedEvmAddress}, SOL: ${resolvedSolAddress}`);

    // Fetch transactions using the resolved EVM address.
    const transactions = resolvedEvmAddress ? await this.fetchTransactions(resolvedEvmAddress) : [];

    const dailyMap = new Map<string, number>();
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    let volume30d = 0; 

    transactions.forEach(tx => {
        const date = new Date(tx.createdAt);
        if (date >= thirtyDaysAgo) {
            const key = date.toISOString().split('T')[0];
            const vol = Math.abs(parseFloat(tx.change.amountInUSD || "0"));
            dailyMap.set(key, (dailyMap.get(key) || 0) + vol);
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

    const referral = activity?.inviteAnalysis;
    const referralVolume30d = referral?.last30dStats?.reduce((acc, day) => {
        return acc + (day.tier1InviterTradeVolume || 0);
    }, 0) || 0;

    const referralStats = {
        totalVolume: referral?.allTierInviteeAnalysis?.tradeVolume || 0,
        volume30d: referralVolume30d,
        totalCommission: referral?.overview?.totalInviteRewards || 0,
        totalInvitees: referral?.overview?.totalInviteeCount || 0,
        history: referral?.last30dStats?.map(day => ({
            date: day.date,
            val: day.tier1InviterTradeVolume || 0
        })) || []
    };

    // --- NEW: FETCH ASSETS ---
    // Fetch all chains in parallel using resolved addresses
    const [ethAssets, baseAssets, bnbAssets, solAssets] = await Promise.all([
        this.fetchChainAssets("eth-mainnet", resolvedEvmAddress, 'ETH'),
        this.fetchChainAssets("base-mainnet", resolvedEvmAddress, 'BASE'),
        this.fetchChainAssets("bsc-mainnet", resolvedEvmAddress, 'BNB'),
        resolvedSolAddress ? this.fetchChainAssets("solana-mainnet", resolvedSolAddress, 'SOL') : Promise.resolve([])
    ]);

    const allAssets = [...ethAssets, ...baseAssets, ...bnbAssets, ...solAssets]
        .sort((a, b) => b.value - a.value); // Sort by highest value

    return {
        totalVolume: activity?.tradeAnalysis?.tradingVolume || 0, 
        volume30d: volume30d,
        lastActive: activity?.tradeAnalysis?.lastTradeAt ? new Date(activity.tradeAnalysis.lastTradeAt) : new Date(),
        calendarData,
        recentTrades,
        referralStats,
        assets: allAssets // Return assets
    };
  }
}