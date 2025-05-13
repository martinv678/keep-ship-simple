import "dotenv/config";
import express from "express";
import * as exphbs from "express-handlebars";
import { handlebarsHelpers } from "./utils/handlebars";
import path from "path";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth";
import { protectedRouter } from "./routes/protected";
import { publicRouter } from "./routes/public";
import morgan from "morgan";
import helmet from "helmet";
import { apiRouter } from "./api/routes";
import mongoose from "mongoose";
import { withUser } from "./middleware/with-user";
import { stripeRouter } from "./routes/stripe";

const app = express();
const PORT = process.env.PORT || 3000;

const hbs = exphbs.create({
  extname: ".hbs",
  helpers: handlebarsHelpers,
});

// Setup Handlebars
app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "views"));

app.use((_, res, next) => {
  res.locals.APP_URL = process.env.APP_URL;
  next();
});

// Stripe webhook MUST be before body parser
app.use("/stripe", stripeRouter);

app.use(cookieParser());
app.use(morgan("dev")); // Logging
app.use(helmet()); // Security headers
app.use(express.static(path.join(__dirname, "../../public")));
app.use(express.urlencoded({ extended: true })); // To parse form POST data
app.use(express.json()); // To parse JSON if needed

// Routes
app.use("/api", apiRouter);

app.use(withUser);
app.use(authRouter);
app.use(protectedRouter);
app.use(publicRouter);

// Start server
const startServer = async () => {
  try {
    const mongoUrl = process.env.MONGO_URI as string;
    await mongoose.connect(mongoUrl);

    console.log("🎉 Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`🌎 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
};

startServer();
