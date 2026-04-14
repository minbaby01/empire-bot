import { jwtDecode } from "jwt-decode";
// import prompts from "prompts";

export const delay = (ms: number): Promise<void> =>
  new Promise((res) => setTimeout(res, ms));

// export const askPrice = async () => {
//   const response = await prompts({
//     type: "text",
//     name: "price",
//     message: "Input price:",
//     validate: (value) => {
//       const trimmed = value.trim();
//       const price = parseFloat(trimmed);
//       const isValidNumber = /^[0-9]+(\.[0-9]+)?$/.test(trimmed);
//       if (!trimmed || isNaN(price) || price <= 0 || !isValidNumber) {
//         return "Invalid price";
//       }
//       return true;
//     },
//   });

//   if (!response.price) {
//     throw new Error("Input cancelled by user (Ctrl+C).");
//   }

//   return response.price;
// };

export const log = (...args: any) => {
  const now = new Date().toLocaleTimeString("en-GB");
  console.log(`[${now}]`, ...args);
};

export const decodeJwt = ({ accessToken }: { accessToken: string }) => {
  const decode = jwtDecode(accessToken);
  return decode;
};

export const getErrorMessage = (err: unknown) => {
  return err instanceof Error ? err.message : String(err);
};

export const parseUtc = (dateStr: string) => {
  return new Date(dateStr.replace(" ", "T") + "Z");
};

export const sendTelegramMessage = async (text: string) => {
  const adminId = process.env.TELE_ID;
  const telegramToken = process.env.TELE_BOT_TOKEN;
  if (!adminId || telegramToken) {
    log("Cannot send");
    return;
  }

  await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: adminId,
      text: text,
    }),
  });
};
