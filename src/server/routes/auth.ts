import express from "express";
import { serialize } from "cookie";
import { withUser } from "../middleware/with-user";
import { User } from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as z from "zod";
import { createCustomer } from "../stripe";

const JWT_SECRET = process.env.JWT_SECRET as string;

const authRouter = express.Router();

authRouter.get("/signup", withUser, (req, res) => {
  res.render("signup", {
    title: "Sign Up",
    mainClass: "bg-gray-50 flex items-center justify-center",
    user: req.user,
  });
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

authRouter.post("/signup", async (req, res) => {
  const parsedBody = signupSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({ error: parsedBody.error });
    return;
  }

  const { email, password } = parsedBody.data;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const stripeCustomer = await createCustomer({ email });

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      stripeCustomerId: stripeCustomer.id,
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    const cookie = serialize("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    res.setHeader("Set-Cookie", cookie);
    res.redirect("/account");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

authRouter.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
    mainClass: "bg-gray-50 flex items-center justify-center",
  });
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    const cookie = serialize("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    res.setHeader("Set-Cookie", cookie);
    res.redirect("/account");
  } catch (err) {
    console.error(err);
  }
});

authRouter.get("/logout", (req, res) => {
  res.setHeader(
    "Set-Cookie",
    serialize("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })
  );

  res.redirect("/");
});

export { authRouter };
