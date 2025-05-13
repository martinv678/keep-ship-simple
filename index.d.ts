import type { UserType } from "./src/server/models/User";

declare global {
  namespace Express {
    interface Request {
      user?: UserType | null;
    }
  }
}

export {};
