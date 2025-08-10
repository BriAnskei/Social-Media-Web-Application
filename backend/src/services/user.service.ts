import jwt from "jsonwebtoken";
import UserModel, { IUser } from "../models/userModel";
import { errThrower } from "./errHandler";

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
  getUserById: async (userId: string): Promise<IUser> => {
    try {
      if (!userId) {
        throw new Error("No Id recieved to retrive user data");
      }
      const userData = (await UserModel.findById(userId)) as IUser | undefined;

      if (!userData) throw new Error("Cannot find user");

      return userData;
    } catch (error) {
      console.log("getUserById, ", error);
      throw new Error("getUserById , " + (error as Error));
    }
  },
  regexSearch: async (query: string, userId?: string): Promise<IUser[]> => {
    try {
      return await UserModel.find({
        ...(userId && { _id: { $ne: userId } }),
        $or: [
          { username: new RegExp(query as string, "i") }, // case sensitive
          { fullName: new RegExp(query as string, "i") },
        ],
      });
    } catch (error) {
      errThrower("regexSearch", error as Error);
      return [];
    }
  },
};
