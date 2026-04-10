export interface KronanProduct {
  sku: string;
  name: string;
  price: number;       // ISK integer (discounted price if on sale)
  originalPrice?: number; // set when onSale is true
  onSale: boolean;
  imageUrl?: string;   // thumbnail
  inStock: boolean;    // false when temporaryShortage
  pricePerKilo?: number;
  baseComparisonUnit?: string;
}

export interface KronanSearchRequest {
  query: string;
  pageSize?: number;
}

export interface KronanSearchResponse {
  results: KronanProduct[];
  count: number;
}

export interface CartLine {
  sku: string;
  quantity: number;
}

export interface NoteAddLine {
  sku?: string;
  text?: string;
  quantity: number;
}

export interface CheckoutResponse {
  lines: Array<{
    sku: string;
    quantity: number;
    product: KronanProduct;
  }>;
  totalPrice: number;
}
