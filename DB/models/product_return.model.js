import mongoose from "mongoose";

const product_returnSchema = mongoose.Schema({
    reason: {
        type: String,
        required: [true, 'reason is required'],
    },
    orderId: {
        type: mongoose.Types.ObjectId,
        ref: "order",
    },
    status: {
        type: String,
        enum: ['in progress', 'returned','rejected'],
        default: 'in progress'
    },
}, { timestamps: true })

export const product_returnModel = mongoose.model('product_return', product_returnSchema)



