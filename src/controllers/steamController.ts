import {
  confirmTradeOfferService,
  createTradeOfferService,
  getWebApiTokenService,
  initSteamEventListener,
  loginSteamService,
} from "../services/steamService";
import { CreateTradeOfferPayload, GetWebApiTokenPayload } from "../types/steam";
import { delay, log } from "../utils/ultis";

export const loginSteamController = async () => {
  try {
    log("Login steam...");
    initSteamEventListener();
    return await loginSteamService();
  } catch (error) {
    throw error;
  }
};

export const createTradeOfferController = async ({
  tradeUrl,
  assetIds,
  message,
}: CreateTradeOfferPayload): Promise<boolean> => {
  let retryCount = 1;
  const maxAttempt = 5;
  while (true) {
    try {
      log(`Create trade offer... (${retryCount})`);
      const newTradeOfferId = await createTradeOfferService({
        tradeUrl: tradeUrl,
        assetIds: assetIds,
        message: message,
      });
      if (!newTradeOfferId) throw new Error("Create trade offer failed");
      log("Create trade offer OK");

      await delay(5000);

      log("Confirm trade...");
      const confirmTradeOffer = await confirmTradeOfferService({
        tradeOfferId: newTradeOfferId,
      });

      if (!confirmTradeOffer) throw new Error("Confirm trade offer failed");
      log("Trade confirmed OK");

      return confirmTradeOffer;
    } catch (error) {
      log(`Attempt ${retryCount} failed: ${error}`);

      retryCount++;
      if (retryCount > maxAttempt) {
        log("All attempts failed");
        throw error;
      } else {
        log("Retrying...");
        await delay(5000);
      }
    }
  }
};

export const getWebApiTokenController = async ({
  cookies,
}: GetWebApiTokenPayload) => {
  try {
    log("Get web api token...");
    const { data } = await getWebApiTokenService({ cookies });
    if (Array.isArray(data)) {
      if (!data.length) throw new Error("Web api return empty");
    } else {
      log("Get web api token OK");
      return data;
    }
  } catch (error) {
    throw error;
  }
};
