import jwt from "jsonwebtoken";
import UserModel from "../models/userModel";

export const userService = {
  createToken: (userId: string) => {
    if (!process.env.ACCESS_SECRET || !process.env.REFRESH_SECRET) {
      throw new Error("token must be defined");
    }

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_SECRET, {
      expiresIn: "7d",
    });

    const accessToken = jwt.sign({ userId }, process.env.ACCESS_SECRET, {
      expiresIn: "30min",
    });
    return { refreshToken, accessToken };
  },
  getUsersFolowers: async (userId: string) => {
    try {
      const userData = await UserModel.findById(userId);
      if (!userData) {
        throw new Error("Cannot find user");
      }

      const allFollowers = userData.followers;

      return allFollowers;
    } catch (error) {
      console.log("getUsersFolowers ,", error);
    }
  },
  getUserById: async (userId: string) => {
    try {
      if (!userId) {
        throw new Error("No Id recieved to retrive user data");
      }
      const userData = UserModel.findById(userId);

      if (!userData) throw new Error("Cannot find user");

      return userData;
    } catch (error) {
      console.log("getUserById, ", error);
    }
  },
};
