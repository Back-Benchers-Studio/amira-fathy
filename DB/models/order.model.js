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
        street: { type: String, required: [true, 'Street is required'] },
        city: { type: String, required: [true, 'City is required'] }
      },
    paymentMethod: {
        type: String,
        enum: ['card', 'cash'],
        default: 'cash'
    },
    status: {
        type: String,
        enum: ['placed', 'recieved','onWay'],
        default: 'placed'
    },
    // isPaid: {
    //     type: Boolean,
    //     default: false
    // },
    // paidAt: Date,
    // isDelivered: {
    //     type: Boolean,
    //     default: false
    // },
    // deliveredAt: Date,


}, { timestamps: true })


export const orderModel = mongoose.model('order', orderSchema)




