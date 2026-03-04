import axios from "axios";

export const empireApi = axios.create({
  baseURL: `https://${process.env.EMPIRE_BASE_URL}/api/v2`,
  timeout: 10000,
  headers: {
    Authorization: `Bearer ${process.env.EMPIRE_API_KEY}`,
    Accept: "	application/json",
    "Content-Type": "application/json",
  },
});
