import "dotenv/config";

import { getInventoryController } from "./controllers/empireController";
import { initEmpireSocket } from "./sockets/empireSocket";
import { askPrice, getErrorMessage, log } from "./utils/ultis";
import { loginSteamController } from "./controllers/steamController";
import { Empire } from "./class/Empire";

export const empireSellQueue = new Empire();

const runBot = async () => {
  try {
    initEmpireSocket();
    await loginSteamController();
    await empireSellQueue.recoverActiveTradeWhenStart();
    await empireSellQueue.checkSteamTokenExpiration();

    const price = await askPrice();
    const items = await getInventoryController();
    empireSellQueue.addAll(
      items.map((i) => ({
        itemId: i.id,
        itemName: i.market_name,
        price,
      })),
    );
  } catch (err) {
    if (empireSellQueue.isProcessing) {
      log("Is processing, not throw");
      return;
    }

    getErrorMessage(err);
  }
};

runBot();
