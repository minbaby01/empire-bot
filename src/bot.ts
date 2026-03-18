import "dotenv/config";

import { getInventoryController } from "./controllers/empireController";
import { initEmpireSocket } from "./sockets/empireSocket";
import { askPrice, getErrorMessage, log } from "./utils/ultis";
import { loginSteamController } from "./controllers/steamController";
import { empire } from "./lib/empireApi";

const runBot = async () => {
  try {
    initEmpireSocket();
    await loginSteamController();
    await empire.recoverActiveTradeWhenStart();
    await empire.checkSteamTokenExpiration();

    const price = await askPrice();
    const items = await getInventoryController();
    empire.addAll(
      items.map((i) => ({
        itemId: i.id,
        itemName: i.market_name,
        price,
      })),
    );
  } catch (err) {
    if (empire.isProcessing) {
      log("Is processing, not throw");
      return;
    }

    getErrorMessage(err);
  }
};

runBot();
