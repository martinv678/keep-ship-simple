import { NextFunction, Request, Response } from "express";

export const withAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  next();
};
