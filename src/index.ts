import express from "express";
import userRoutes from "./Router/userRoutes";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());
export const JWT_SECRET = process.env.SECRET;

app.use(userRoutes);

app.listen(3000, () => {
  console.log("Your app is up and successfully running on port 3000");
});
