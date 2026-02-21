export type User = {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: string;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  unitPrice: number | string;
  currency: 'TRY' | 'USD' | 'EUR';
  isActive?: boolean;
};

export type ProductsResponse = {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type StockSummaryItem = {
  productId: string;
  productName: string;
  totalQuantity: number;
};

export type StockSummaryResponse = {
  items: StockSummaryItem[];
  total?: number;
};
