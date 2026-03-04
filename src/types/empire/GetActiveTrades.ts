import { Sticker } from "./GetCs2Inventory";

export type GetActiveTradeResponse = {
  success: boolean;
  data: WalletData;
};

export interface WalletData {
  deposits: Deposit[];
  withdrawals: Withdrawal[];
}

export interface Deposit {
  id: number;
  total_value: number;
  item_id: number;
  item: DepositItem;

  status: number;
  status_message: string;
  tradeoffer_id: number;

  metadata: DepositMetadata;

  created_at: string;
  updated_at: string;
  suggested_price: number;
}

export interface DepositItem {
  app_id: number;
  context_id: number;
  type: string;
  asset_id: number;

  blue_percentage: string;
  fade_percentage: string;

  created_at: string;
  full_position: number;
  icon_url: string;
  id: number;

  is_commodity: boolean;
  market_name: string;
  market_value: number;
  name_color: string;
  position: string;
  preview_id: string;

  price_is_unreliable: boolean;
  stickers: Sticker[];

  suggested_price: number;
  tradable: boolean;
  trade_exists: boolean;
  tradelock: boolean;
  updated_at: string;
  wear: number;
}

export interface Withdrawal {
  id: number;
  total_value: number;
  item_id: number;
  item: WithdrawalItem;

  status: number;
  status_message: string;
  tradeoffer_id: number;

  metadata: WithdrawalMetadata;

  auction_number_of_bids: number;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalItem {
  market_name: string;
  market_value: number;
  icon_url: string;
  id: number;

  is_commodity: boolean;
  name_color: string;
  price_is_unreliable: boolean;

  suggested_price: number;
}

export interface DepositMetadata {
  item_validation: ItemValidation;
  expires_at: number;
  trade_url: string;
  item_inspected: boolean;
  partner: Partner;
  auction_number_of_bids: number;
}

export interface WithdrawalMetadata {
  item_validation: ItemValidation;
  expires_at: number;
  auction_number_of_bids: number;
}

export interface ItemValidation {
  numWrongItemDetections: number;
  validItemDetected: boolean;
}

export interface Partner {
  steam_id: string;
  steam_name: string;
  avatar: string;
  avatar_full: string;
  profile_url: string;
  timecreated: number;
  steam_level: number;
}
