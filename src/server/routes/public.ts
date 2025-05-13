import { Router } from "express";

const publicRouter = Router();

publicRouter.get("/", async (req, res) => {
  res.render("home", {
    title: "This is your title",
    user: req.user,
    description: "This is your SEO description",
  });
});

export { publicRouter };
