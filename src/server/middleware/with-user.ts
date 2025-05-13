import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User, UserType } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const withUser = async (
  req: Request,
  _: Response,
  next: NextFunction
) => {
  if (!req.cookies.session) {
    next();
    return;
  }

  const token = jwt.verify(req.cookies.session, JWT_SECRET) as {
    userId: string;
  };

  const user = await User.findById(token.userId).select(
    "-passwordHash -stripeCustomerId"
  );

  req.user = user;

  next();
};
