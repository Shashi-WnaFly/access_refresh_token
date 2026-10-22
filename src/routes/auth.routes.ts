import express from "express";
import * as authRouter from "../controllers/auth/auth.controller.js";
const router = express.Router();

router.post("/api/auth", authRouter.registerHandler);



export default router;
