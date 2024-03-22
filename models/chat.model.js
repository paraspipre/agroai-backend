import mongoose, { Schema } from "mongoose";


const messageSchema = new Schema(
   {
      user: {
         type: String
      },
      ai: {
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
         default: "Title"
      },
      messages: [
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