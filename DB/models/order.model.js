import mongoose from "mongoose";


const orderSchema = mongoose.Schema({

    user: { type: mongoose.Types.ObjectId, ref: 'user' }, // each user has many orders
    cartItems: [
        {
            product: { type: mongoose.Types.ObjectId, ref: 'product' },
            category: { type: mongoose.Types.ObjectId, ref: 'category' },
            // quantity: Number,
            price: Number
        }
    ], 
    totalOrderPrice: Number,// price of all products in cart with or without discounts
    phone:{ type: String, required: [true, 'Phone is required'] },
    shippingAddress: {
        type: String,
         required: [true, 'shippingAddress is required'] ,
      },
    paymentMethod: {
        type: String,
        enum: ['card', 'cash'],
        default: 'cash'
    },
    status: {
        type: String,
        enum: ['placed', 'received','onWay','cancelled'],
        default: 'placed'
    },
    quantity: {
        type: Number,
        default: 1
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: Date,
    isDelivered: {
        type: Boolean,
        default: false
    },
    deliveredAt: Date,


}, { timestamps: true })


export const orderModel = mongoose.model('order', orderSchema)




