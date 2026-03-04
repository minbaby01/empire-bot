import axios from "axios";
import TradeOfferManager from "steam-tradeoffer-manager";
import SteamUser from "steam-user";
import SteamCommunity from "steamcommunity";

export const client = new SteamUser();

export const community = new SteamCommunity();

export const manager = new TradeOfferManager({
  steam: client,
  community,
  language: "en",
});

export const steamApi = axios.create({
  baseURL: "https://steamcommunity.com",
  timeout: 10000,
});
