import mongoose from "mongoose";

const couponSchema = mongoose.Schema({
    code: {
        type: String,
        trim: true,
        required: [true, 'coupon code is required'],
        unique: true
    },
    discount: {
        type: Number,
        min: [1,"min discountis 1%"],
        max: [100,"max discountis 100%"],
        required: [true, 'coupon discount is required'],

    },
    expires: {
        type: Date,
        required: [true, 'coupon date is required'],
    },
    usedBY:[{// to check if coupon used before or not
        type: mongoose.Types.ObjectId,
        ref: "user"
    }],
    createdBY:{
        type: mongoose.Types.ObjectId,
        ref: "user",
        required: [true, 'product owner is required'],
    },
    updatedBY:{
        type: mongoose.Types.ObjectId,
        ref: "user",
    }
}, { timestamps: true })

export const couponModel = mongoose.model('coupon', couponSchema)



