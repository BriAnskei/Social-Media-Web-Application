import { Request, Response } from "express";
import bcrypt from "bcrypt";
import validator from "validator";
import UserModel, { IUser } from "../models/userModel";
import jwt from "jsonwebtoken";

const createToken = (userId: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be defined");
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Properly typed request handler
export const register = async (req: Request, res: Response): Promise<any> => {
  const { username, fullName, email, password, profilePicture, bio } = req.body;
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
      profilePicture,
      bio,
    });

    const savedUser = await newUser.save();

    // Generate token
    const token = createToken(savedUser._id.toString());

    // Return response
    res.json({ sucess: true, token });
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
