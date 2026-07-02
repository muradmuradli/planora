import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",           // Backend URL
  // No /api/auth here — let the adapter decide the path
});