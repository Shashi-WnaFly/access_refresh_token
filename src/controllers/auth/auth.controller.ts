import type { Request, Response } from "express";
import userModel from "../../models/user.js";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { loginSchema, registerSchema } from "./auth.schema.js";
import { compareHash, passwordHash } from "../../lib/hash.js";
import { SendEmail } from "../../lib/email.js";
import config from "../../config/config.js";
import { createAccessToken, createRefreshToken } from "../../lib/token.js";

function getAppUrl() {
  return config.APP_URL || `http://localhost:${config.PORT}`;
}

export async function registerHandler(req: Request, res: Response) {
  try {
    const result = registerSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: `Invalid data! error: ${z.flattenError(result.error)}`,
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

    const verifyToken = jwt.sign(
      { sub: savedUser._id },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" },
    );

    const verifyUrl = `${getAppUrl()}/api/auth/verify-email?token=${verifyToken}`;

    await SendEmail(
      savedUser.email,
      "Verify your email",
      `<p>please verify your email by clicking this link : </p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
    );

    res.status(201).json({
      status: "success",
      message: "Registration is successfully done.",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        isEmailVerified: savedUser.isEmailVerified,
      },
    });
  } catch (error) {
    console.log("Error : ", (error as Error).message);
    return res.status(500).json({
      success: false,
      message: "Interval server error.",
    });
  }
}

export async function verifyEmailHandler(req: Request, res: Response) {
  const token = (req.query.token as string) || undefined;

  if (!token)
    return res.status(400).json({
      success: false,
      message: "Verification token is missing",
    });

  try {
    const payload = jwt.verify(token, config.JWT_SECRET!) as {
      sub: string;
    };

    if (!payload) {
      return res.status(400).json({
        success: false,
        message: "Verification token is invalid or expired",
      });
    }

    const user = await userModel.findById(payload.sub);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: true,
        message: "Your email already verified",
      });
    }

    user.isEmailVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email is now verified! you can login",
    });
  } catch (error) {
    console.log("Error: ", (error as Error).message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: `Invalid data! error: ${z.flattenError(result.error)}`,
      });
    }

    const { email, password } = result.data;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: `Credentials are invalid!`,
      });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: `Verify your email first then try loggin in...`,
      });
    }

    if (!compareHash(password, user.passwordHash)) {
      return res.status(400).json({
        success: false,
        message: `Credentials are invalid!`,
      });
    }

    const accessToken = createAccessToken(
      user._id.toString(),
      user.role,
      user.tokenVersion,
    );

    const refreshToken = createRefreshToken(
      user._id.toString(),
      user.tokenVersion,
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        name: user.name,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
      },
    });
  } catch (error) {
    console.log("Error: ", (error as Error).message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
