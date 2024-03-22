import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"
const app = express()

app.use(cors({
    origin:"http://localhost:3000",
    credentials: true
}))

app.use(morgan(':method :status :url'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from './routes/user.routes.js'

//routes declaration
app.use("/api/v1/users", userRouter)

// http://localhost:8000/api/v1/users/register

export { app }