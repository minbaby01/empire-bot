import { client, community, manager, steamApi } from "../lib/steamApi";
import SteamTotp from "steam-totp";
import {
  CreateTradeOfferPayload,
  ConfirmTradeOfferPayload,
  MaData,
  GetWebApiTokenResponse,
  GetWebApiTokenPayload,
} from "../types/steam";
import { delay, log } from "../utils/ultis";
import SteamUser from "steam-user";
import {
  APP_ID,
  CONTEXT_ID,
  RELOGIN_DELAY,
  RELOGIN_TIMEOUT,
} from "../constant/constant";
import { clearCookies, setCookies } from "../storage/steamCookies";
import { empire } from "../lib/empireApi";

const MADATA = process.env.MADATA;
const MADATA_PARSE: MaData = JSON.parse(MADATA!);

export const loginSteamService = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const loginDetails = {
      accountName: process.env.STEAM_USERNAME!,
      password: process.env.STEAM_PASSWORD!,
      twoFactorCode: SteamTotp.generateAuthCode(MADATA_PARSE.shared_secret),
    };

    client.logOn(loginDetails);
    client.once("loggedOn", () => resolve());
    client.once("error", () => reject());
  });
};

export const createTradeOfferService = async ({
  tradeUrl,
  assetIds,
  message,
}: CreateTradeOfferPayload): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Create offer
    const offer = manager.createOffer(tradeUrl);

    // Add items
    const items = assetIds.map((assetId) => ({
      appid: APP_ID,
      contextid: CONTEXT_ID,
      assetid: assetId,
      amount: 1,
    }));

    // @ts-ignore
    offer.addMyItems(items);

    if (message) {
      offer.setMessage(message);
    }

    // Send offer
    offer.send((err, status) => {
      if (err) {
        reject(err);
      } else {
        resolve(offer.id!);
      }
    });
  });
};

export const confirmTradeOfferService = async ({
  tradeOfferId,
}: ConfirmTradeOfferPayload): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      confirmTradeOfferService({ tradeOfferId }).then(resolve).catch(reject);
    }, 5000);

    community.acceptConfirmationForObject(
      MADATA_PARSE.identity_secret,
      tradeOfferId,
      (err) => {
        clearTimeout(timeout);
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      },
    );
  });
};

export const getWebApiTokenService = async ({
  cookies,
}: GetWebApiTokenPayload) => {
  const { data } = await steamApi.get<GetWebApiTokenResponse>(
    "/pointssummary/ajaxgetasyncconfig",
    {
      headers: {
        Cookie: cookies.join("; "),
      },
    },
  );

  return data;
};

export const initSteamEventListener = () => {
  client.on("loggedOn", () => {
    log("Steam login successful");
    client.setPersona(SteamUser.EPersonaState.Online);
  });

  client.on("webSession", (sessionid, cookies) => {
    log("Got web session");
    setCookies(cookies);
    community.setCookies(cookies);
    manager.setCookies(cookies, (err) => {
      if (err) {
        log(err);
      } else {
        log("Trade manager ready");
      }
    });
  });

  let isRelogin = false;
  community.on("sessionExpired", async (err) => {
    if (isRelogin) return;

    isRelogin = true;
    log(`Session expired, logging in again: ${err}`);

    clearCookies();

    try {
      if (!client.steamID) {
        await loginSteamService();
        return;
      }

      await new Promise<void>((resolve) => {
        log("webLogOn...");
        client.webLogOn();
        client.once("webSession", async () => {
          log("Callback update token...");
          await empire.updateSteamTokenToEmpire();
          resolve();
        });
        setTimeout(resolve, RELOGIN_TIMEOUT);
      });

      await delay(RELOGIN_DELAY);
    } catch (error) {
      log(error);
    } finally {
      isRelogin = false;
    }
  });

  client.once("error", (err) => {
    log(err);
  });
};
