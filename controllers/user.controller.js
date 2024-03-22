import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { Chat, Message } from "../models/chat.model.js";

const generateAccessTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        return { accessToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const options = {
    httpOnly: true,
    secure: true,
    path: "/",
    sameSite: "none",
    maxAge:900000000
}

const registerUser = asyncHandler(async (req, res) => {
    const { email, name, password } = req.body
    console.log(email)

    if (
        [email, name, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({ email })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const user = await User.create({
        name,
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -chatHistory"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    const { accessToken } = await generateAccessTokens(user._id)

    

    return res.status(201).cookie("accessToken", accessToken, options).json(
        new ApiResponse(200, {
            user: createdUser, accessToken
        }, "User registered Successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    console.log(email);

    if (!email) {
        throw new ApiError(400, "email is required")
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken } = await generateAccessTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -chatHistory")

    

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken
                },
                "User logged In Successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "User fetched successfully"
        ))
})

const createChat = asyncHandler(async (req, res) => {
    const userdata = await User.findById(req.user._id)
    console.log(userdata)
    const chat = await Chat.create({ title: `Chat ${Number(userdata?.chatHistory?.length) + 1}` })
    const user = await User.findByIdAndUpdate(req.user._id, { $push: { chatHistory: chat._id } })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user.chatHistory,
                "chat created fetched successfully"
            )
        )
})

const updateChat = asyncHandler(async (req, res) => {
    const { chatid } = req.params
    const {user, ai} = req.body
    const msg = await Message.create({
        user,
        ai
    })
    const chat = await Chat.findByIdAndUpdate(chatid, { $push: { messages: msg._id } })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                chat,
                "chat updated successfully"
            )
        )
})

const updateChatTitle = asyncHandler(async (req, res) => {
    const { chatid } = req.params
    const { title } = req.body
    const chat = await Chat.findByIdAndUpdate(chatid, { $set: { title } })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                chat,
                "chat title updated successfully"
            )
        )
})

const getChat = asyncHandler(async (req, res) => {
    const { chatid } = req.params
    const chat = await Chat.findById(chatid).populate({ path: "messages", select: { user: 1, ai: 1, _id: 0 }, options: { sort: { createdAt: 1 } } })
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                chat,
                "chat history fetched successfully"
            )
        )
})

const deleteChat = asyncHandler(async (req, res) => {
    const { chatid } = req.params
    const user = await User.findByIdAndUpdate(req.user._id,{$pull:{chatHistory:chatid}})
    const chat = await Chat.findByIdAndDelete(chatid)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                chat,
                "chat deleted successfully"
            )
        )
})

const getChatHistory = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate("chatHistory").sort({updatedAt:1})

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user.chatHistory,
                "chat history fetched successfully"
            )
        )
})


export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    getChatHistory,
    createChat,
    updateChat,
    getChat,
    deleteChat,
    updateChatTitle
}