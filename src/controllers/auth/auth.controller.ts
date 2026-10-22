import type { Request, Response } from "express";
import userModel from "../../models/user.js";
import {z} from "zod";
import jwt from "jsonwebtoken";
import { registerSchema } from "./auth.schema.js";
import { passwordHash } from "../../lib/hash.js";

export async function registerHandler(req: Request, res: Response) {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      const flatten = z.flattenError(result.error);
      return res.status(400).json({
        success: false,
        message: `Invalid data! error: ${flatten}`,
      });
    }

    const { name, email, password } = result.data;

    const isUserExists = await userModel.findOne({ email });

    if (isUserExists) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use. try with a different email.",
      });
    }

    const passwordHashed = await passwordHash(password);

    const savedUser = await userModel.create({
      name,
      email,
      passwordHash: passwordHashed,
    });

    const refreshToken = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    const accessToken = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: process.env.NODE_ENV === "production",
      secure: true,
      sameSite: "strict",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    res.status(201).json({
      status: "success",
      message: "Registration is successfully done.",
      accessToken,
    });
  } catch (error) {
    console.log("Error : ", (error as Error).message);
  }
}

export async function getMe(req: Request, res: Response) {
  try {
  } catch (error) {
    console.log("Error: ", (error as Error).message);
  }
}
