import { Request, Response } from "express";
import bcrypt from "bcrypt";
import validator from "validator";
import UserModel, { IUser } from "../models/userModel";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";

import { nameSuffix } from "../middleware/upload";

const createToken = (userId: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be defined");
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

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
