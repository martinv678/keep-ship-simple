import type { UserType } from "./models/User";

declare global {
  namespace Express {
    interface Request {
      user?: UserType | null;
    }
  }
}
