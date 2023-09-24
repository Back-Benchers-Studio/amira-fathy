import mongoose from "mongoose";


const orderSchema = mongoose.Schema({

    user: { type: mongoose.Types.ObjectId, ref: 'user' }, // each user has many orders
    cartItems: [
        {
            product: { type: mongoose.Types.ObjectId, ref: 'product' },
            quantity: Number,
            price: Number
        }
    ],
    totalOderPrice: Number,
    shippingAddress: {
        street: { type: String, required: [true, 'Street is required'] },
        city: { type: String, required: [true, 'City is required'] },
        phone: { type: String, required: [true, 'Phone is required'] }
      },
    // shippingAddress: {
    //     street: String,
    //     city: String,
    //     phone: String,
    //     required: [true, 'shipping address is required']
    // },
    paymentMethod: {
        type: String,
        enum: ['card', 'cash'],
        default: 'cash'
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




