import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  userId?: string;
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
      process.env.ACCESS_SECRET as string
    ) as { userId: string };

    req.userId = token_decode.userId; // Attach the user's ID to the request body

    next(); // Pass control to the route handler functions
  } catch (error) {
    console.error("Error decoding token:", error);
    res.status(401).json({ success: false, message: "Token-expired" });
  }
};

export default authMiddleware;
