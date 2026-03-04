import { MINUTE, ONE_HOUR, WS_RESPONSE_TIME } from "../constant/constant";
import { TRADE_STATUS } from "../constant/tradeStatus";
import {
  cancelDepositController,
  createDepositController,
  getActiveDepositController,
  getStatusController,
  getTradeController,
  markAsSentController,
  updateTokenController,
} from "../controllers/empireController";
import {
  createTradeOfferController,
  getWebApiTokenController,
} from "../controllers/steamController";
import { getCookies } from "../storage/steamCookies";
import {
  decodeJwt,
  delay,
  getErrorMessage,
  log,
  parseUtc,
} from "../utils/ultis";

type QueueItem = {
  itemId: number;
  itemName: string;
  price: number;
};

type DepositItem = {
  depositId: number | null;
  itemId: number | null;
  itemName: string | null;
};

export class Empire {
  private queue: QueueItem[] = [];
  public isProcessing: boolean = false;
  private depositItem: DepositItem = {
    depositId: null,
    itemId: null,
    itemName: null,
  };

  constructor() {
    ///
  }

  addAll(items: QueueItem[]) {
    this.queue.push(...items);
    this.processNext();
  }

  private async processNext() {
    if (this.isProcessing) return;
    if (!this.queue.length) {
      log("End queue");
      process.exit(1);
    }

    const item = this.queue.shift()!;

    this.isProcessing = true;
    this.depositItem = {
      depositId: null,
      itemId: item.itemId,
      itemName: item.itemName,
    };

    try {
      await createDepositController([
        {
          id: item.itemId,
          price: item.price,
        },
      ]);

      await delay(WS_RESPONSE_TIME);

      if (!this.depositItem.depositId) {
        log(`${WS_RESPONSE_TIME / 1000} secs gone, try get deposit status`);

        const deposits = await getActiveDepositController();
        const item = deposits
          .filter((d) => d.status === TRADE_STATUS.PROCESSING)
          .find((d) => d.item.id === this.depositItem.itemId);

        if (!item) {
          throw new Error("Unk error");
        }
      }
    } catch (err) {
      log(`Deposit failed: ${getErrorMessage(err)}`);

      log("Next deposit in 5s");
      await delay(5000);

      this.isProcessing = false;
      this.processNext();
    }
  }

  async handleTradeStatus(event: any) {
    log(event);

    for (const dataEvent of event) {
      const { id, item_id, status, metadata, item, updated_at } =
        dataEvent.data;

      switch (status) {
        case 2:
          log(`EMPIRE: Waiting buyer...`);

          if (item_id === this.depositItem.itemId) {
            this.depositItem.depositId = id;
          }

          break;

        case 3:
          log("EMPIRE: Sending...");

          const now = Date.now();
          const updatedAtDate = parseUtc(updated_at);
          const isLate = now - updatedAtDate.getTime() > ONE_HOUR;

          const steamName = metadata?.partner?.steam_name;

          const greeting = isLate ? "Sorry" : "Hello";
          const apology = isLate ? "my bot was crashed, " : "";
          const name = steamName ? ` ${steamName},` : ",";

          const message = `${greeting}${name} ${apology}remember to confirm when you receive the item`;

          try {
            await createTradeOfferController({
              assetIds: [item.asset_id],
              tradeUrl: metadata.trade_url.toString(),
              message: message,
            });
            await markAsSentController({ depositId: id });
          } catch (error) {
            log(error);
          }
          break;

        case 4:
          log("EMPIRE: New order detect");
          break;

        case 5:
          log("EMPIRE: Wait user confirm");
          break;

        case 13:
          if (id != this.depositItem.depositId) return;

          log("EMPIRE: Completed!");
          this.isProcessing = false;
          await delay(5000);
          this.processNext();
          break;

        case 8:
          if (id != this.depositItem.depositId) return;

          log("EMPIRE: Deposit cancel!");
          this.isProcessing = false;
          await delay(5000);
          this.processNext();
          break;

        case 11:
          log("EMPRIRE: Disputed");

        default:
          break;
      }
    }
  }

  async handleMissingEvent() {
    log(this.depositItem.depositId, this.isProcessing);

    if (!this.isProcessing || !this.depositItem.depositId) return;

    try {
      const data = await getTradeController({
        depositId: this.depositItem.depositId,
        type: "deposit",
      });

      if (!data) return;

      this.handleTradeStatus([
        {
          data: {
            id: data.id,
            status: data.status,
            metadata: data.metadata,
            item: data.item,
            update_at: data.updated_at,
          },
        },
      ]);
    } catch (err) {
      log(`Check active failed: ${err}`);
    }
  }

  async recoverActiveTradeWhenStart() {
    try {
      const deposits = await getActiveDepositController();

      const depositData = deposits.filter(
        (d) => d.status != TRADE_STATUS.COMPLETED_BUT_REVERSIBLE,
      );

      if (!depositData.length) return;

      for (const d of depositData) {
        const { id, status, metadata, item, updated_at } = d;

        if (status === TRADE_STATUS.PROCESSING) {
          await cancelDepositController({ depositId: id });
          continue;
        }

        this.handleTradeStatus([
          {
            data: {
              id: id,
              status: status,
              metadata: metadata,
              item: item,
              updated_at: updated_at,
            },
          },
        ]);
      }

      await delay(5000);
    } catch (err) {
      log(`Recover active trade failed: ${err}`);
    }
  }

  async checkSteamTokenExpiration() {
    const { access_token_expires_at } = await getStatusController();

    const expiresAt = new Date(access_token_expires_at);

    let isExpired = expiresAt.getTime() - Date.now() <= 0 ? true : false;
    if (!isExpired) {
      log(`Expire at: ${expiresAt}`);
      return;
    }
    this.updateSteamTokenToEmpire();
  }

  public async updateSteamTokenToEmpire() {
    try {
      const cookies = this.cookies;

      if (!cookies || !cookies.length) {
        throw new Error("Cookies not found");
      }
      const data = await getWebApiTokenController({
        cookies: cookies,
      });
      if (!data) return;

      const updateToken = await updateTokenController({
        access_token: data.webapi_token,
      });

      if (!updateToken.success) {
        throw new Error(updateToken?.message);
      }

      const decode = decodeJwt({ accessToken: data.webapi_token });
      if (decode.exp) {
        log(`Next schedule update at: ${new Date(decode.exp)}`);
      }
    } catch (err) {
      log(err);
    }
  }

  get cookies() {
    return getCookies();
  }
}
