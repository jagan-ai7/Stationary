import axios from "axios";

export const clod = axios.create({
  baseURL: process.env.CLOD_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.CLOD_API_KEY}`,
    "Content-Type": "application/json",
  },
});
