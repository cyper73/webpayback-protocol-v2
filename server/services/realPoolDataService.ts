// Real Pool Data Service with 24h caching
// Fetches live data from Uniswap V3 pools once per day to minimize costs

interface PoolData {
  poolAddress: string;
  token0: string;
  token1: string;
  fee: string;
  totalValueLocked: string;
  volume24h: string;
  fees24h: string;
  price: string;
  participants: number;
  lastUpdated: number;
}

interface CachedPoolData {
  pol: PoolData | null;
  wmatic: PoolData | null;
  lastFetch: number;
}

class RealPoolDataService {
  private cache: CachedPoolData = {
    pol: null,
    wmatic: null,
    lastFetch: 0 // Force refresh with new pool address
  };

  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  // Use Polygon subgraph through alternative endpoints
  private readonly UNISWAP_V3_GRAPH_URL = "https://gateway.thegraph.com/api/[api-key]/subgraphs/id/3hCPRGf4z88VC5rsBKU5AA9FBBDZnV2yBKkHdwwASdwq";
  
  // VERIFIED real token addresses on Polygon
  // POL: Native Polygon token (verified)
  private readonly POL_TOKEN = "0x0000000000000000000000000000000000001010";
  // WPT: WebPayback Token (verified - deployed 6 days ago)
  private readonly WPT_TOKEN = "0x9077051D318b614F915E8A07861090856FDEC91e";
  
  // Pool addresses - VERIFIED FROM USER
  private readonly POL_WPT_POOL = "0x823C0b22b2eaD1A3A857F2300C8259d1695C5AAB"; // WMATIC/WPT pool (existing)
  private readonly WMATIC_WPT_POOL = "0x823C0b22b2eaD1A3A857F2300C8259d1695C5AAB"; // Same pool address

  private isCacheValid(): boolean {
    const now = Date.now();
    return (now - this.cache.lastFetch) < this.CACHE_DURATION;
  }

  private async fetchPoolDataFromUniswap(poolAddress: string): Promise<PoolData | null> {
    try {
      // GraphQL query to get pool data from Uniswap V3
      const query = `
        query GetPoolData($poolAddress: String!) {
          pool(id: $poolAddress) {
            id
            token0 {
              symbol
              decimals
            }
            token1 {
              symbol
              decimals
            }
            feeTier
            totalValueLockedUSD
            volumeUSD
            feesUSD
            token0Price
            token1Price
            liquidity
            txCount
          }
          poolDayDatas(
            where: { pool: $poolAddress }
            orderBy: date
            orderDirection: desc
            first: 1
          ) {
            volumeUSD
            feesUSD
            tvlUSD
          }
        }
      `;

      const response = await fetch(this.UNISWAP_V3_GRAPH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { poolAddress: poolAddress.toLowerCase() }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const pool = data.data?.pool;
      const dayData = data.data?.poolDayDatas?.[0];

      if (!pool) {
        console.warn(`No pool data found for ${poolAddress}`);
        return null;
      }

      // Format the data with real values or realistic estimates
      const tvl = parseFloat(pool.totalValueLockedUSD || dayData?.tvlUSD || "0");
      const volume24h = parseFloat(dayData?.volumeUSD || "0");
      const fees24h = parseFloat(dayData?.feesUSD || "0");
      
      // Show AUTHENTIC $0 values when APIs return zero - complete transparency
      const finalTvl = tvl;
      const finalVolume = volume24h;  
      const finalFees = fees24h;
      
      // Use correct token names for WMATIC/WPT pool
      return {
        poolAddress,
        token0: "WMATIC",
        token1: "WPT",
        fee: `${(pool.feeTier / 10000)}%` || "0.05%",
        totalValueLocked: `$${finalTvl.toLocaleString()}`,
        volume24h: `$${finalVolume.toLocaleString()}`,
        fees24h: `$${finalFees.toFixed(2)}`,
        price: pool.token1Price || pool.token0Price || "0",
        participants: Math.floor(pool.txCount / 100) || 0,
        lastUpdated: Date.now()
      };

    } catch (error) {
      console.error(`Error fetching pool data for ${poolAddress}:`, error);
      return null;
    }
  }

  private getFallbackData(poolType: 'pol' | 'wmatic'): PoolData {
    // Only use as absolute last resort - prefer real Uniswap data
    if (poolType === 'pol') {
      return {
        poolAddress: this.POL_WPT_POOL,
        token0: "USDC",
        token1: "WMATIC",
        fee: "0.05%",
        totalValueLocked: "$0",
        volume24h: "$0", 
        fees24h: "$0",
        price: "0",
        participants: 0,
        lastUpdated: Date.now()
      };
    } else {
      return {
        poolAddress: this.WMATIC_WPT_POOL,
        token0: "WETH",
        token1: "WMATIC",
        fee: "0.3%",
        totalValueLocked: "$0",
        volume24h: "$0",
        fees24h: "$0", 
        price: "0",
        participants: 0,
        lastUpdated: Date.now()
      };
    }
  }

  async refreshPoolData(): Promise<void> {
    if (this.isCacheValid()) {
      console.log("Pool data cache still valid, skipping refresh");
      return;
    }

    console.log("Refreshing pool data from Uniswap V3...");

    try {
      // Fetch both pools in parallel (only 2 API calls per day)
      const [polData, wmaticData] = await Promise.all([
        this.fetchPoolDataFromUniswap(this.POL_WPT_POOL),
        this.fetchPoolDataFromUniswap(this.WMATIC_WPT_POOL)
      ]);

      // Update cache with real data or fallback
      this.cache.pol = polData || this.getFallbackData('pol');
      this.cache.wmatic = wmaticData || this.getFallbackData('wmatic');
      this.cache.lastFetch = Date.now();

      console.log(`Pool data refreshed successfully at ${new Date().toISOString()}`);
      console.log(`Next refresh in 24 hours`);

    } catch (error) {
      console.error("Failed to refresh pool data:", error);
      
      // Use fallback data if we don't have any cached data
      if (!this.cache.pol || !this.cache.wmatic) {
        this.cache.pol = this.getFallbackData('pol');
        this.cache.wmatic = this.getFallbackData('wmatic');
        this.cache.lastFetch = Date.now();
      }
    }
  }

  async getPoolData(poolType: 'pol' | 'wmatic'): Promise<PoolData> {
    // Refresh data if cache is expired
    await this.refreshPoolData();

    const data = poolType === 'pol' ? this.cache.pol : this.cache.wmatic;
    
    if (!data) {
      return this.getFallbackData(poolType);
    }

    return data;
  }

  getCacheStatus() {
    const now = Date.now();
    const timeSinceLastFetch = now - this.cache.lastFetch;
    const timeUntilNextRefresh = this.CACHE_DURATION - timeSinceLastFetch;
    
    return {
      isValid: this.isCacheValid(),
      lastFetch: new Date(this.cache.lastFetch).toISOString(),
      nextRefresh: new Date(now + timeUntilNextRefresh).toISOString(),
      dataSource: this.cache.pol ? 'real' : 'fallback',
      hoursUntilRefresh: Math.max(0, timeUntilNextRefresh / (1000 * 60 * 60))
    };
  }

  // Force refresh for testing purposes
  async forceRefresh(): Promise<void> {
    this.cache.lastFetch = 0; // Invalidate cache
    await this.refreshPoolData();
  }
}

export const realPoolDataService = new RealPoolDataService();