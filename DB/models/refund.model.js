import mongoose from "mongoose";

const refundSchema = mongoose.Schema({
    paymentIntent: {
        type: String,
        required: [true, 'paymentIntent is required'],
        unique: true,
    },
    orderId: {
        type: mongoose.Types.ObjectId,
        ref: "order"
    },
    RefundObject: {
        type: Object
    },
    // intent: {
    //     type: String,
    //     default:''
    // },
    // isSuccess: {
    //     type: Boolean,
    //     default:false
    // }  
}, { timestamps: true })

export const refundModel = mongoose.model('refund', refundSchema)



