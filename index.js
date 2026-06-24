import "dotenv/config";
import express from "express";
import { authenticationMiddleware } from "./middleware/auth.middleware.js";
import userRouter from "./routes/user.routes.js";
import urlRouter from "./routes/url.route.js";

const app = express();
const PORT = process.env.PORT ?? 8000;

app.use(express.json());
app.use(authenticationMiddleware);

app.get("/", (req, res) => {
  return res.json({ status: "Server is up and running..." });
});

//* Routes
app.use(urlRouter);
app.use("/user", userRouter);

app.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));
