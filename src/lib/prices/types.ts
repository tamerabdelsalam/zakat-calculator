export interface MetalPrices {
  gold: {
    pricePerGramUSD: number;
    pricePerOunceUSD: number;
    updatedAt: string;
  };
  silver: {
    pricePerGramUSD: number;
    pricePerOunceUSD: number;
    updatedAt: string;
  };
}

export interface CurrencyRates {
  base: string;
  rates: Record<string, number>;
  updatedAt: string;
}

export interface PriceData {
  metals: MetalPrices;
  currencies: CurrencyRates;
  nisab: {
    goldNisab: number;
    silverNisab: number;
    currency: string;
  };
  fetchedAt: string;
}
