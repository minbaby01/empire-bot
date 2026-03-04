export type GetStatusResponse = {
  success: boolean;
  data: {
    steam_id: string;
    trade_url: string;
    has_api_key: boolean;
    has_access_token: boolean;
    access_token_expires_at: string;
    automation_enabled_read_only: boolean;
  };
};
