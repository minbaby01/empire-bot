export type GetTradePayload = {
  depositId: number;
  type: "bid" | "deposit" | "withdrawal";
};

export type GetTradeResponse = {
  success: true;
  data: GetTradeDepositResponse | null;
};

export type GetTradeDepositResponse = {
  id: number;
  total_value: number;
  item_id: number;
  item: {
    asset_id: number;
    blue_percentage: number | null;
    created_at: string;
    fade_percentage: number | null;
    full_position: number;
    icon_url: string;
    id: number;
    is_commodity: boolean;
    keychains: any[];
    market_name: string;
    market_value: number;
    name_color: string;
    position: number;
    preview_id: number | null;
    price_is_unreliable: boolean;
    stickers: any[];
    suggested_price: number;
    tradable: boolean;
    trade_exists: boolean;
    tradelock: boolean;
    type: string;
    updated_at: string;
    wear: number | null;
  };
  status: number;
  status_message: string;
  tradeoffer_id: number;
  created_at: string;
  updated_at: string;
  metadata: {
    item_validation: {
      numWrongItemDetections: number;
      validItemDetected: boolean;
    };
    expires_at: number;
    trade_url: string;
    item_inspected: boolean;
    item_position_in_inventory: number;
    partner: {
      steam_id: string;
      steam_name: string;
      avatar: string;
      avatar_full: string;
      profile_url: string;
      timecreated: number;
      steam_level: number;
    };
    suggested_price: number;
  };
};
