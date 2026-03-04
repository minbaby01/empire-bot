export type GetCs2InventoryResponse = {
  success: boolean;
  updatedAt: number;
  allowUpdate: boolean;
  data: InventoryItem[];
};

export interface InventoryItem {
  asset_id: number;
  created_at: string; // "YYYY-MM-DD HH:mm:ss"
  custom_price_percentage: string;
  full_position: number;
  icon_url: string;
  id: number;
  invalid: string;
  is_commodity: boolean;
  market_name: string;
  market_value: number;
  name_color: string;
  position: string;
  preview_id: string;
  price_is_unreliable: number;
  stickers: Sticker[];
  tradable: boolean;
  tradelock: boolean;
  updated_at: string;
  wear: number;
}

export interface Sticker {
  sticker_id: number;
  wear: number | null;
  name: string;
  image: string;
}
