import mongoose from "mongoose";

const sessionSchema = mongoose.Schema({
    session_id: {
        type: String,
        required: [true, 'session id is required'],
        unique: true,
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "user"
    },
    order: {
        type: mongoose.Types.ObjectId,
        ref: "order"
    },
    intent: {
        type: String,
        default:''
    },
    isSuccess: {
        type: Boolean,
        default:false
    }  
}, { timestamps: true })

export const sessionModel = mongoose.model('session', sessionSchema)



