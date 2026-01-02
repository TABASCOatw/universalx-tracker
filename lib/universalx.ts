// lib/universalx.ts

const RPC_URL = "https://universal-rpc-staging.particle.network/";
const ACTIVITY_API = "https://universal-app-api-staging.particle.network/user_activity";

// --- NEW: COVALENT CONFIG ---
const COVALENT_API_KEY = process.env.COVALENT_API_KEY || "cqt_rQvR7qJTDhXP7h9PrJyv6Xgg8qjv"; 
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
      const cleanAddress = address.trim();
      const isEvm = cleanAddress.startsWith('0x');
      const queryParam = isEvm ? `evmAddress=${cleanAddress}` : `solanaAddress=${cleanAddress}`;

      console.log(`[UniversalX] Fetching activity for: ${cleanAddress}`);

      const res = await fetch(`${ACTIVITY_API}?${queryParam}`, {
        cache: 'no-store' 
      });

      if (!res.ok) {
        console.error(`[UniversalX] Activity API failed: ${res.status}`);
        return null;
      }

      return await res.json();
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
          return [];
      }
  }

  // UPDATED: Now accepts "addr1,addr2" and aggregates data
  static async getTraderData(addressString: string) {
    const rawAddresses = addressString.split(',').map(a => a.trim()).filter(Boolean);
    const uniqueAddresses = Array.from(new Set(rawAddresses));

    let grandTotalVolume = 0;
    let allTransactions: Transaction[] = [];
    let allAssets: Asset[] = [];
    let latestActive = new Date(0);

    let combinedReferralStats = {
        totalVolume: 0,
        volume30d: 0,
        totalCommission: 0,
        totalInvitees: 0,
        history: [] as any[]
    };
    const referralHistoryMap: Record<string, number> = {};

    // 1. Parallel Fetching for ALL addresses
    await Promise.all(uniqueAddresses.map(async (address) => {
        // A. Activity
        const activity = await this.fetchUserActivity(address);

        // B. Resolve Addresses (EVM/SOL)
        const basicInfo = (activity as any)?.basicInfo || (activity as any)?.basic_info;
        const apiEvmAddress = basicInfo?.evmAddress || basicInfo?.evm_address;
        const resolvedEvmAddress = apiEvmAddress || (address.startsWith('0x') ? address : "");
        const resolvedSolAddress = basicInfo?.solanaAddress || basicInfo?.solana_address || (!address.startsWith('0x') ? address : "");

        // C. Transactions
        const txs = resolvedEvmAddress ? await this.fetchTransactions(resolvedEvmAddress) : [];
        allTransactions.push(...txs);

        // D. Assets
        const [eth, base, bnb, sol] = await Promise.all([
            this.fetchChainAssets("eth-mainnet", resolvedEvmAddress, 'ETH'),
            this.fetchChainAssets("base-mainnet", resolvedEvmAddress, 'BASE'),
            this.fetchChainAssets("bsc-mainnet", resolvedEvmAddress, 'BNB'),
            resolvedSolAddress ? this.fetchChainAssets("solana-mainnet", resolvedSolAddress, 'SOL') : Promise.resolve([])
        ]);
        allAssets.push(...eth, ...base, ...bnb, ...sol);

        // E. Aggregate Simple Stats
        grandTotalVolume += (activity?.tradeAnalysis?.tradingVolume || 0);
        
        const lastAt = activity?.tradeAnalysis?.lastTradeAt ? new Date(activity.tradeAnalysis.lastTradeAt) : new Date(0);
        if (lastAt > latestActive) latestActive = lastAt;

        // F. Aggregate Referral Stats
        const ref = activity?.inviteAnalysis;
        combinedReferralStats.totalVolume += (ref?.allTierInviteeAnalysis?.tradeVolume || 0);
        combinedReferralStats.totalCommission += (ref?.overview?.totalInviteRewards || 0);
        combinedReferralStats.totalInvitees += (ref?.overview?.totalInviteeCount || 0);

        // Sum 30d Referral Volume
        const ref30d = ref?.last30dStats?.reduce((acc: number, day: any) => acc + (day.tier1InviterTradeVolume || 0), 0) || 0;
        combinedReferralStats.volume30d += ref30d;

        // Merge Referral History
        ref?.last30dStats?.forEach((day: any) => {
            referralHistoryMap[day.date] = (referralHistoryMap[day.date] || 0) + (day.tier1InviterTradeVolume || 0);
        });
    }));

    // 2. Process Aggregated Transactions (Calendar & 30d Vol)
    const dailyMap = new Map<string, number>();
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    let volume30d = 0; 

    allTransactions.forEach(tx => {
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

    const recentTrades = allTransactions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map(tx => ({
            token: tx.targetToken?.symbol || "Unknown",
            type: tx.tag === 'buy' ? 'Buy' : 'Sell',
            size: `$${Math.abs(parseFloat(tx.change.amountInUSD)).toFixed(2)}`,
            time: new Date(tx.createdAt),
            image: tx.targetToken?.image
        }));

    combinedReferralStats.history = Object.keys(referralHistoryMap).sort().map(date => ({
        date,
        val: referralHistoryMap[date]
    }));

    // Sort combined assets by value
    allAssets.sort((a, b) => b.value - a.value);

    return {
        totalVolume: grandTotalVolume, 
        volume30d: volume30d,
        lastActive: latestActive.getTime() === 0 ? new Date() : latestActive,
        calendarData,
        recentTrades,
        referralStats: combinedReferralStats,
        assets: allAssets
    };
  }
}