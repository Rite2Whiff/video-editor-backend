import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from ".";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).json({
      message: "You are not authorized",
    });
    return;
  }
  const decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayload;

  if (!decoded) {
    res.status(401).json({
      message: "You are not authorized",
    });
    return;
  }
  req.userId = decoded.id;
  next();
}
