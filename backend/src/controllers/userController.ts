import { Request, Response } from "express";
import bcrypt from "bcrypt";
import validator from "validator";
import UserModel, { IUser } from "../models/userModel";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";

import { nameSuffix } from "../middleware/upload";
import { exists } from "fs-extra";

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
      const fileName = `${nameSuffix}${req.file.originalname}`;

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
      const fileName = `${nameSuffix}${newProfileImage.originalname}`;
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
    console.log(error);
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
    console.log(req.body);

    if (!userId || !followerId) {
      throw new Error("Attributes are required: userId, followerId");
    }

    // First check if user exists
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User cannot be found (user does not exist)",
      });
    }

    // Check if followerId already exists in the followers array
    const isFollowing = user.followers.includes(followerId);

    let updateData;
    let message;

    if (isFollowing) {
      // If already following, remove (unfollow)
      updateData = await UserModel.findByIdAndUpdate(userId, {
        $pull: { followers: followerId },
      });
      message = "User successfully unfollowed";
    } else {
      // If not following, add (follow)
      updateData = await UserModel.findByIdAndUpdate(userId, {
        $push: { followers: followerId },
      });
      message = "User successfully followed";
    }

    console.log(updateData);

    return res.json({ success: true, message });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};
