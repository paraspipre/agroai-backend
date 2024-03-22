import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    registerUser,
    getCurrentUser,
    getChatHistory,
    createChat,
    getChat,
    deleteChat,
    updateChat,
    updateChatTitle,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT,  logoutUser)
router.route("/user").get(verifyJWT, getCurrentUser)
router.route("/history").get(verifyJWT, getChatHistory)
router.route("/chat").post(verifyJWT, createChat)
router.route("/chat/:chatid").get(verifyJWT, getChat).put(verifyJWT, updateChat).patch(verifyJWT, updateChatTitle).delete(verifyJWT, deleteChat)
export default router