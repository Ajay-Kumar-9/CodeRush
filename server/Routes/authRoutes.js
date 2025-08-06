import { Signup, Login } from "../Controllers/authController.js";
import {Gemini} from '../Controllers/chatgpt.js' 
import {Router} from 'express';

const router = Router();

router.post("/auth/signup", Signup);
router.post("/auth/login", Login);
router.post("/ask" , Gemini);


export default router;
