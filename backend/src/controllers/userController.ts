import { Request, Response } from "express";
import bcrypt from "bcrypt";
import validator from "validator";
import UserModel, { IUser } from "../models/userModel";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";

import { generateNameSuffix, getImages } from "../middleware/upload";
import { contactService } from "../services/contact.service";
import { ConvoService } from "../services/conversation.service";
import {
  ChatRelationPayload,
  UserChatRelationService,
} from "../services/UserChatRelation.service";

const createToken = (userId: string) => {
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
};
// fOR UPLOADING DEFAULT PROFILE FUNCTION
// async function getDefaultImageBuffer(): Promise<Buffer> {
//   // _dirname returns the head point directory of the file
//   const defaultImagePath = path.join(
//     __dirname,
//     "../assets/Default_Profile.jpg"
//   );
//   try {
//     return await fsValidation.readFile(defaultImagePath);
//   } catch (error) {
//     throw new Error("Default image not found.");
//   }
// }

// function checkDefaultImage() {
//   const defaultImagePath = "uploads/profile/Default_Profile.jpg";

//   // Check if the file exists and if it's not empty
//   fs.stat(defaultImagePath, (err, stats) => {
//     if (err) {
//       console.log("Error: File does not exist or cannot be accessed");
//       return false;
//     }

//     if (stats.size > 0) {
//       console.log("The default image file exists and is not empty");
//       return true;
//     } else {
//       console.log("The default image file is empty");
//       return false;
//     }
//   });
// }

interface ExtendReq extends Request {
  userId?: string; //explicitly extend the Request type from Express to include the userId property.
}

// Properly typed request handler
export const register = async (req: Request, res: Response): Promise<any> => {
  const { username, fullName, email, password } = req.body;
  try {
    // mongoose query using "or" operator for email, usernames
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.json({
        success: false,
        message: "User with this email or username already exists",
      });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email.",
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      username,
      fullName,
      email,
      password: hashedPassword,
    });

    const userId = newUser._id.toString(); // Ensure userId is a string

    const uploadPath = path.join("uploads", "profile", userId);
    await fs.promises.mkdir(uploadPath, { recursive: true }); // Creates the upload path deriectory if it doesn't Exist

    if (req.file) {
      const fileName = `${generateNameSuffix}${req.file.originalname}`;

      const filePath = path.join(uploadPath, fileName);
      await fs.promises.writeFile(filePath, req.file.buffer); // Save the file from to memory disk

      newUser.profilePicture = fileName;
    }

    await newUser.save();

    // Generate token
    const token = createToken(userId);
    // Return response
    res.json({ success: true, token });
  } catch (error) {
    console.error("Register error:", error);
    return res.json({ success: false, message: "Error" });
  }
};

export const fetchCurrentUser = async (
  req: ExtendReq,
  res: Response
): Promise<any> => {
  const userId = req.userId;

  try {
    if (!userId) return res.json({ success: false, message: "UnAuthorize" });

    const currentUser = await UserModel.findById(userId);

    res.json({ success: true, user: currentUser });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

export const fetchAllUsers = async (
  _: ExtendReq,
  res: Response
): Promise<any> => {
  try {
    const allUsers = await UserModel.find({});

    res.json({ success: true, user: allUsers });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    // Find user by email

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User Doesn't exist" });
    }

    // compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ success: false, message: "Invalid credentials" });

    const token = createToken(user._id.toString());
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

export const updateProfile = async (
  req: ExtendReq,
  res: Response
): Promise<any> => {
  try {
    const userId = req.userId;
    const newProfileImage = req.file;
    const { fullName, bio } = req.body;

    const updatedData: {
      fullName: string;
      bio: string;
      profilePicture?: string;
    } = { fullName, bio };

    if (!userId) return res.json({ success: false, message: "Unauthorized" });

    // Check if there is attached file, if so save to servere and set as a newProfile
    if (newProfileImage) {
      console.log(newProfileImage);

      const fileName = `${generateNameSuffix()}${newProfileImage.originalname}`;
      const uploadPath = path.join("uploads", "profile", userId.toString());

      await fs.promises.mkdir(uploadPath, { recursive: true }); // Creates the upload path deriectory if it doesn't Exist

      const filePath = path.join(uploadPath, fileName);

      await fs.promises.writeFile(filePath, newProfileImage.buffer);

      updatedData.profilePicture = fileName;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.userId,
      {
        $set: updatedData, //$set to update specific fields
      },
      { new: true } // return the updated document
    );

    if (!updatedUser) {
      return res.json({ success: false, message: "user Not Found" });
    }

    res.json({
      success: true,
      user: updatedUser,
      message: "User succesfully updated",
    });
  } catch (error) {
    console.log("updating profile error: ", error);
    return res.json({ success: false, message: "Error" });
  }
};

export const authorization = async (
  req: ExtendReq,
  res: Response
): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.json({
        success: false,
        message: "Unauthorize",
      });
    }

    res.json({
      success: true,
      message: "authenticated",
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

export const followUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId, followerId } = req.body;

    if (!userId || !followerId) {
      throw new Error("Attributes are required: userId, followerId");
    }

    // First check if user exists
    const userToBeFollowed = await UserModel.findById(userId);
    const userWhoFollowed = await UserModel.findById(followerId);

    if (!userToBeFollowed || !userWhoFollowed) {
      return res.json({
        success: false,
        message: "one the  user cannot be found (possibly does not exist)",
      });
    }

    // Check if followerId already exists in the followers array
    const isFollowing =
      userToBeFollowed.followers.includes(followerId) &&
      userWhoFollowed.following.includes(userId);

    const servicePayload: ChatRelationPayload = {
      payload: {
        userId: followerId as string,
        otherUserId: userId as string,
      },
      isUnfollowing: isFollowing,
    };

    await UserChatRelationService.updateChatRelation(servicePayload);

    let tobeFollowedData, whoFollowedData;
    let message;

    const returnUpdate = { new: true }; // nothing special, just return the updated data

    if (isFollowing) {
      tobeFollowedData = await UserModel.findByIdAndUpdate(
        userId,
        {
          $pull: { followers: followerId },
        },
        returnUpdate
      );

      whoFollowedData = await UserModel.findByIdAndUpdate(
        followerId,
        {
          $pull: { following: userId },
        },
        returnUpdate
      );

      message = "User successfully unfollowed";
    } else {
      tobeFollowedData = await UserModel.findByIdAndUpdate(
        userId,
        {
          $push: { followers: followerId },
        },
        returnUpdate
      );

      whoFollowedData = await UserModel.findByIdAndUpdate(
        followerId,
        {
          $push: { following: userId },
        },
        returnUpdate
      );
      message = "User successfully followed";
    }

    return res.json({ success: true, message });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

export const profileSearch = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { query } = req.query;

    if (!query || (query as string).trim() === "") {
      return res.json({
        success: true,
        message: "no query to return fetch",
        user: [],
      });
    }

    const result = await UserModel.find({
      $or: [
        { username: new RegExp(query as string, "i") }, // case sensitive
        { fullName: new RegExp(query as string, "i") },
      ],
    });

    res.json({
      success: true,
      message: "user successfully fretched",
      user: result,
    });
  } catch (error) {
    console.log("Failed to fetch seach " + error);
    return res.json({ success: false, message: "Error" });
  }
};

export const getUserImages = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { path, userId } = req.body;

    const baseUrl = `http://${req.get("host")}`;

    if (!userId) {
      throw new Error("No user id to proccess this request");
    }

    const images = await getImages(userId, baseUrl);

    res.json({
      success: true,
      message: "Image succesfully fetched",
      images,
    });
  } catch (error) {
    console.error("Failed to fetch  images " + error);
    return res.json({ success: false, message: "Error" });
  }
};

export const getFollow = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.body;

    if (!userId) throw new Error("No userId to proccess this request");

    const userData = await UserModel.findById(userId);

    if (!userData) throw new Error("User data doesnt exist");

    res.json({
      success: true,
      message: "Image succesfully fetched",
      data: { followers: userData.followers, following: userData.following },
    });
  } catch (error) {
    console.error("Failed to fetch  user followers " + error);
    return res.json({ success: false, message: "Error" });
  }
};

// Server socket export
export const getUsersFolowers = async (userId: string) => {
  try {
    const userData = await UserModel.findById(userId);
    if (!userData) {
      throw new Error("Cannot find user");
    }

    const allFollowers = userData.followers;

    return allFollowers;
  } catch (error) {
    console.log(error);
  }
};

export const getUserById = async (userId: string) => {
  try {
    if (!userId) {
      throw new Error("No Id recieved to retrive user data");
    }
    const userData = UserModel.findById(userId);

    if (!userData) throw new Error("Cannot find user");

    return userData;
  } catch (error) {
    console.log(error);
  }
};
