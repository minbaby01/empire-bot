import { io } from "socket.io-client";
import { log } from "../utils/ultis";
import { client } from "../lib/steamApi";
import SteamUser from "steam-user";
import { empireApi } from "../lib/empireApi";
import { empireSellQueue } from "../bot";

const domain = process.env.EMPIRE_BASE_URL;
const socketEndpoint = `wss://trade.${domain}/trade`;

let userData: any = null;
let userDataRefreshedAt: any = null;

const refreshUserData = async () => {
  if (userDataRefreshedAt && userDataRefreshedAt > Date.now() - 15 * 1000) {
    // refreshed less than 15s ago, should be still valid
    return;
  }

  try {
    // Get the user data from the socket
    // Token is valid 30s
    userData = (await empireApi.get(`/metadata/socket`)).data;
    userDataRefreshedAt = Date.now();
  } catch (error: any) {
    log(`Failed to refresh user data: ${error.message}`);
  }
};

export const initEmpireSocket = async () => {
  return new Promise((resolve, reject) => {
    log("Connecting to websocket...");

    const initSocket = async () => {
      await refreshUserData();
      try {
        const socket = io(socketEndpoint, {
          transports: ["websocket"],
          path: "/s/",
          secure: true,
          rejectUnauthorized: false,
          reconnection: true,
          query: {
            uid: userData.user.id,
            token: userData.socket_token,
          },
          extraHeaders: { "User-Agent": `${userData.user.id} API Bot` },
        });

        const connectionTimeout = setTimeout(() => {
          socket.disconnect();
          reject(new Error("Socket connection timeout"));
        }, 30000);

        socket.on("connect", async () => {
          // Log when connected
          log(`Connected to websocket`);
          clearTimeout(connectionTimeout);

          socket.off("init");

          // Handle the Init event
          socket.on("init", async (data) => {
            if (data && data.authenticated) {
              log(`Successfully authenticated as ${data.name}`);

              socket.emit("filters", {
                price_max: 9999999,
              });

              empireSellQueue.handleMissingEvent();
              client.setPersona(SteamUser.EPersonaState.Online);
              resolve(socket);
            } else {
              await refreshUserData();
              // When the server asks for it, emit the data we got earlier to the socket to identify this client as the user
              socket.emit("identify", {
                uid: userData.user.id,
                model: userData.user,
                authorizationToken: userData.socket_token,
                signature: userData.socket_signature,
              });
            }
          });
        });

        socket.on("trade_status", (data) => {
          empireSellQueue.handleTradeStatus(data);
        });

        socket.on("disconnect", (error) => {
          log(`Socket disconnected: ${error}`);
        });

        socket.on("connect_error", (error) => {
          log(`Connect Error: ${error}`);
          clearTimeout(connectionTimeout);
          reject(error);
        });

        socket.on("error", (error) => {
          log(`WS Error: ${error}`);
        });

        socket.on("close", (reason) => {
          log(`Socket closed: ${reason}`);
        });

        socket.on("reconnect", (attemptNumber) => {
          log(`Reconnected after ${attemptNumber} attempts`);
        });

        socket.on("reconnecting", (attemptNumber) => {
          log(`Attempting to reconnect... (${attemptNumber})`);
        });
      } catch (error) {
        log(`Error while initializing the Socket. Error: ${error}`);
        reject(error);
      }
    };

    initSocket();
  });
};
