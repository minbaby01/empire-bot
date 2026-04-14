import * as fs from "fs";
import { log } from "./ultis";
import { ItemPriceConfig } from "../types/config";
import prompts from "prompts";

const FILE_PATH = "../config/itemPrice.json";

export const getItemPrice = (): ItemPriceConfig => {
  if (!fs.existsSync(FILE_PATH)) {
    throw new Error("Price config not found");
  }

  const data = fs.readFileSync(FILE_PATH, "utf-8");
  log("Item price data:");
  console.log(data);

  return JSON.parse(data);
};

export const updateItemPrice = (itemName: string, price: number) => {};

export const getOrUpdateConfig = async (itemName: string[]) => {
  const itemPriceData = getItemPrice();
  if (!itemPriceData) {
    log("Create config");
    const response = await prompts([
      {
        type: "multiselect",
        name: "price",
        message: "Pick item",
        choices: [{ title: "Red", value: "#ff0000" }],
      },
    ]);
  }
};
