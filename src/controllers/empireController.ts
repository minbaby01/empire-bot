import { RATE } from "../constant/constant";
import {
  cancelDepositService,
  createDepositService,
  getActiveTradesService,
  getCs2InventoryService,
  getStatusService,
  getTradeService,
  markAsSentService,
  updateTokenService,
} from "../services/empireService";
import { delay, log } from "../utils/ultis";
import { GetTradePayload } from "../types/empire/GetTrade";
import { CreateDepositItemsControllerPayload } from "../types/empire/CreateDeposit";
import { MarkAsSentPayload } from "../types/empire/MarkAsSent";
import { UpdateTokenPayload } from "../types/empire/UpdateToken";
import { CancelDepositPayload } from "../types/empire/CancelDeposit";

export const createDepositController = async (
  items: CreateDepositItemsControllerPayload,
) => {
  const depositData = items.map((i) => {
    const coinValue = Number((i.price / RATE).toFixed(2).replace(".", ""));
    log(`Deposit ${i.id}`);
    return {
      id: i.id,
      coin_value: coinValue,
    };
  });

  try {
    await createDepositService(depositData);
    log("Wait ws response to check");
  } catch (error) {
    throw error;
  }
};

export const getActiveDepositController = async () => {
  log("Get active deposit...");

  try {
    const {
      data: { deposits },
    } = await getActiveTradesService();

    return deposits;
  } catch (error) {
    throw error;
  }
};

export const getInventoryController = async () => {
  log("Get active trades");

  try {
    const {
      data: { deposits },
    } = await getActiveTradesService();

    const depositedItemIds: number[] = [];

    for (const d of deposits) {
      depositedItemIds.push(d.item_id);
    }

    await delay(5000);
    log("Get inventory");
    const { data } = await getCs2InventoryService();

    const items = data
      .filter((item) => item.market_name === process.env.ITEM_NAME)
      .filter((item) => !depositedItemIds.includes(item.id));

    if (!items.length) throw new Error("Out of stock");

    return items;
  } catch (error) {
    throw error;
  }
};

export const markAsSentController = async ({
  depositId,
}: MarkAsSentPayload) => {
  log("Mark as sent...");

  try {
    const res = await markAsSentService({ depositId: depositId });
    if (res.success) {
      log("Mark as sent OK");
      return res;
    } else {
      throw new Error(res.error);
    }
  } catch (error) {
    log(`Mark as sent error: ${error}`);
  }
};

export const getTradeController = async ({
  depositId,
  type = "deposit",
}: GetTradePayload) => {
  log("Get trade...");

  try {
    const { data } = await getTradeService({
      depositId: depositId,
      type: type,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const getStatusController = async () => {
  log("Get status");

  try {
    const { data } = await getStatusService();
    if (!data) {
      throw new Error("Get status service error");
    }
    log(`Access token expire at: ${new Date(data.access_token_expires_at)}`);
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateTokenController = async ({
  access_token,
}: UpdateTokenPayload) => {
  log("Update web api token...");

  try {
    const data = await updateTokenService({ access_token });
    if (!data.success) throw new Error(data.message);
    log("Update web api token OK");
    return data;
  } catch (error) {
    throw error;
  }
};

export const cancelDepositController = async ({
  depositId,
}: CancelDepositPayload) => {
  log("Cancel deposit...");

  try {
    await cancelDepositService({ depositId });
    await delay(5000);
    log("Maybe cancel OK");
  } catch (error) {
    log(`Cancel failed: ${error}`);
  }
};
