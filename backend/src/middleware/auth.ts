import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  body: {
    userId?: string; // Optional since it will be added after decoding
    [key: string]: any; // Allow additional keys in the body
  };
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers?.token as string;

  if (!token) {
    res.json({ success: false, message: "Not Authorized, Login Again" });
    return;
  }

  try {
    const token_decode = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { id: string };
    req.body.userId = token_decode.id; // Attach the user's ID to the request body
    next(); // Pass control to the route handler functions
  } catch (error) {
    console.error("Error decoding token:", error);
    res.json({ success: false, message: "Error" });
  }
};

export default authMiddleware;
