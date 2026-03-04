export type UpdateTokenPayload = {
  access_token: string;
};

export type UpdateTokenResponse = {
  success: boolean;
  message?: string;
};
