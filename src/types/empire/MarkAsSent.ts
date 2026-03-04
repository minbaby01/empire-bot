export type MarkAsSentPayload = {
  depositId: string;
};

export type MarkAsSentSuccess = { success: true };

export type MarkAsSentNotFound = {
  success: false;
  error: string;
};

export type MarkAsSentResponse = MarkAsSentSuccess | MarkAsSentNotFound;
