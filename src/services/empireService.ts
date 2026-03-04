import { AxiosError } from "axios";
import { empireApi } from "../lib/empireApi";
import { GetCs2InventoryResponse } from "../types/empire/GetCs2Inventory";
import { CreateDepositItemsPayload } from "../types/empire/CreateDeposit";
import { GetActiveTradeResponse } from "../types/empire/GetActiveTrades";
import {
  MarkAsSentPayload,
  MarkAsSentResponse,
  MarkAsSentSuccess,
} from "../types/empire/MarkAsSent";
import { CancelDepositPayload } from "../types/empire/CancelDeposit";
import { GetStatusResponse } from "../types/empire/GetStatus";
import {
  UpdateTokenPayload,
  UpdateTokenResponse,
} from "../types/empire/UpdateToken";
import { GetTradePayload, GetTradeResponse } from "../types/empire/GetTrade";

export const getCs2InventoryService = async () => {
  const { data } = await empireApi.get<GetCs2InventoryResponse>(
    `/trading/user/inventory`
  );
  return data;
};

export const createDepositService = async (
  dataItems: CreateDepositItemsPayload
): Promise<void> => {
  await empireApi.post(`/trading/deposit`, {
    items: dataItems,
  });
};

export const getActiveTradesService = async () => {
  const { data } = await empireApi.get<GetActiveTradeResponse>(
    `/trading/user/trades`
  );
  return data;
};

export const cancelDepositService = async ({
  depositId,
}: CancelDepositPayload): Promise<void> => {
  await empireApi.post(`/trading/deposit/${depositId}/cancel`);
};

export const markAsSentService = async ({
  depositId,
}: MarkAsSentPayload): Promise<MarkAsSentResponse> => {
  try {
    const { data } = await empireApi.post<MarkAsSentSuccess>(
      `/trading/deposit/${depositId}/sent`
    );
    return data;
  } catch (err) {
    const error = err as AxiosError;

    if (error.response?.status === 404) {
      return { success: false, error: "Not found or already marked" };
    }

    return { success: false, error: error.message };
  }
};

export const getTradeService = async ({ depositId, type }: GetTradePayload) => {
  const { data } = await empireApi.get<GetTradeResponse>(
    `/trading/user/trade/${depositId}/${type}`
  );

  return data;
};

export const getStatusService = async () => {
  const { data } = await empireApi.get<GetStatusResponse>(
    "/trading/automation/status"
  );

  return data;
};

export const updateTokenService = async ({
  access_token,
}: UpdateTokenPayload) => {
  const { data } = await empireApi.put<UpdateTokenResponse>(
    "/trading/automation/access-token",
    { access_token }
  );

  return data;
};
