import jwt from "jsonwebtoken";

export const createToken = (userId: string) => {
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
