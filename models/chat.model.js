import mongoose, { Schema } from "mongoose";


const messageSchema = new Schema(
   {
      role: {
         type: String
      },
      content: {
         type: String
      }
   },
   {
      timestamps: true
   }
)

export const Message = mongoose.model("Message", messageSchema)

const chatSchema = new Schema(
   {
      title: {
         type: String,
         default:"Title"
      },
      message: [
         {
            type: Schema.Types.ObjectId,
            ref: "Message"
         }
      ]
   },
   {
      timestamps: true
   }
)

export const Chat = mongoose.model("Chat", chatSchema)