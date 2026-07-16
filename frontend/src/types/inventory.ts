export type EventType = "PURCHASE" | "SALE";

export type Product = {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  description: string | null;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type InventoryTransaction = {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  eventType: EventType;
  quantity: number;
  unitPrice: string;
  fifoCost: string | null;
  referenceNumber: string;
  createdAt: string;
};

export type DashboardData = {
  kpis: {
    activeProducts: number;
    totalUnitsOnHand: number;
    totalInventoryValue: string;
  };
  productStock: Array<{
    productId: string;
    sku: string;
    name: string;
    quantity: number;
    value: string;
  }>;
  recentTransactions: InventoryTransaction[];
  streamingStatus: {
    connected: boolean;
    topic: string;
  };
};

export type ProcessedEventPayload = {
  eventId: string;
  eventType: EventType;
  transactionId: string;
  fifoCost: string | null;
  productId: string;
  quantity: number;
  unitPrice: number;
};
