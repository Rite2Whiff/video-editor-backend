import { Router } from "express";
import bcrypt from "bcrypt";
import { prismaClient } from "../prismaClient";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "..";

const router = Router();

router.post("/api/user/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      message: "Please provide signup details",
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 5);

  try {
    const user = await prismaClient.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    res.status(200).json({
      message: "You have singned up successfully",
      id: user.id,
    });
  } catch (error) {
    res.status(509).json({
      message: "Something went wrong. Please try again after a few minutes",
    });
  }
});

router.post("/api/user/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      message: "Please provide signup details",
    });
    return;
  }

  const findUser = await prismaClient.user.findFirst({
    where: {
      email,
    },
  });

  if (!findUser) {
    res.status(404).json({
      message: "User not found",
    });
    return;
  }

  const verifyPassword = await bcrypt.compare(password, findUser.password);

  if (!verifyPassword) {
    res.status(401).json({
      message: "Incorrect password",
    });
    return;
  }

  try {
    const token = jwt.sign(
      { id: findUser.id },
      JWT_SECRET as unknown as string
    );
    res.status(200).json({
      message: "You have successfully signed in",
      token,
    });
  } catch (error) {
    res.status(509).json({
      message: "Something went wrong. Please try again after a few minutes",
    });
  }
});

router.get("/api/user", (req, res) => {});

export default router;
