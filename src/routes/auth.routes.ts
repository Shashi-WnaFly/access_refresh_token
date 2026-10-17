import express from "express";
import * as authRouter from "../controllers/auth.js";
const router = express.Router();

router.post("/api/auth", authRouter.register);
