import mongoose from "mongoose";
import { productModel } from "./product.model.js";

const cartSchema = mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'user' },// each user has a 1 cart 
    cartItems: [
        {
            product: { type: mongoose.Types.ObjectId, ref: 'product' },
            quantity: {
                type: Number,
                default: 1
            },
            price: Number,
            totalProductDiscount: Number,
        }
    ],
    totalPrice: Number,
    totalPriceAfterDiscount: Number,
    discount: Number //50


}, { timestamps: true })


export const cartModel = mongoose.model('cart', cartSchema)




