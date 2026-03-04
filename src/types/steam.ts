export type CreateTradeOfferPayload = {
  tradeUrl: string;
  assetIds: (string | number)[];
  message?: string;
};

export type ConfirmTradeOfferPayload = {
  tradeOfferId: string;
};

export type MaData = {
  shared_secret: string;
  identity_secret: string;
};

export type GetWebApiTokenPayload = {
  cookies: string[];
};

type WebApiToken = {
  webapi_token: string;
};

export type GetWebApiTokenResponse = {
  success: 1;
  data: WebApiToken | never[];
};
