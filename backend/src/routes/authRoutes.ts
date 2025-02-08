import express, { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/userModel";

const authRoutes: Router = express.Router();

const generateToken = (userId: string): string => {
  if (!process.env.ACCESS_SECRET) throw new Error("token must be definned");

  return jwt.sign({ userId }, process.env.ACCESS_SECRET, {
    expiresIn: "30min",
  }) as string;
};

authRoutes.post(
  "/refresh",
  async function (req: Request, res: Response): Promise<any> {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res
        .status(400)
        .json({ sucess: false, message: "No Refresh Token" });

    try {
      const token_decode = jwt.verify(
        refreshToken as string,
        process.env.REFRESH_SECRET as string
      ) as { userId: string };

      // validate decoded token
      const tokenOwner = await UserModel.findById(token_decode.userId);
      if (!tokenOwner)
        return res.json({ sucess: false, message: "Invalid userID" });
      const newAccessToken = generateToken(token_decode.userId);

      res.json({ sucess: true, newAccessToken: newAccessToken });
    } catch (error) {
      console.log(error);
      res.status(400).json({ success: false, message: "error" });
    }
  }
);

export default authRoutes;
