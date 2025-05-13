import { Router } from "express";
import { withAuthentication } from "../middleware/with-authentication";

const protectedRouter = Router();

protectedRouter.get("/account", withAuthentication, async (req, res) => {
  res.render("account", {
    user: req.user,
    title: "Account",
  });
});

export { protectedRouter };
