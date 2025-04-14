import express from "express";
import cors from "cors";
import authRouter from "./modules/auth.module/auth.route";
import categoryRouter from "./modules/category.module/category.route";
import userRouter from "./modules/user.module/user.route";
import gameRouter from "./modules/game.module/game.route";
import wishlistRouter from "./modules/wishlist.module/wishlist.route";
import libraryRouter from "./modules/library.module/library.route";
import reviewRouter from "./modules/review.module/review.route";
import friendshipRouter from "./modules/friendship.module/friendship.route";
import cartRouter from "./modules/cart.module/cart.route";

const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/games", gameRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/library", libraryRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/friendships", friendshipRouter);
app.use("/api/cart", cartRouter);

app.listen(PORT, () => console.log(`Server is working on port ${PORT}!`));
