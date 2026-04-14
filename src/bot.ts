import "dotenv/config";

import { getInventoryController } from "./controllers/empireController";
import { initEmpireSocket } from "./sockets/empireSocket";
import { getErrorMessage, log, sendTelegramMessage } from "./utils/ultis";
import { loginSteamController } from "./controllers/steamController";
import { empire } from "./lib/empireApi";
import { getItemPrice } from "./utils/itemPriceUtils";

const runBot = async () => {
  try {
    initEmpireSocket();
    await loginSteamController();
    await empire.recoverActiveTradeWhenStart();

    const prices = getItemPrice();
    const items = await getInventoryController();

    empire.addAll(
      items.map((i) => {
        const price = prices[i.market_name];

        return {
          itemId: i.id,
          itemName: i.market_name,
          price: price,
        };
      }),
    );
  } catch (err) {
    if (empire.isProcessing) {
      log("Is processing, not throw");
      return;
    }

    getErrorMessage(err);
    await sendTelegramMessage(String(err));
  }
};

runBot();
