import { Signup, Login } from "../Controllers/authController.js";
import { Gemini } from "../Controllers/chatgpt.js";
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/auth/signup", Signup);
router.post("/auth/login", Login);
router.post("/ask", authMiddleware, Gemini);

export default router;
