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
    expires_at: {
        type: Number,
        required: [true, 'expires_at is required'],
    },
    isSuccess: {
        type: Boolean,
        default:false
    },
    isHandled: {
        type: Boolean,
        default:false
    },
}, { timestamps: true })

export const sessionModel = mongoose.model('session', sessionSchema)



