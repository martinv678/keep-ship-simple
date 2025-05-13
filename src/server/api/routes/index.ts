import { Router } from "express";

const apiRouter = Router();

apiRouter.get("/", (_, res) => {
  res.json({
    message: "Hello from your API!",
  });
});

export { apiRouter };
