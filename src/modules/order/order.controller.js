
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { cartModel } from "../../../DB/models/cart.model.js";
import { productModel } from "../../../DB/models/product.model.js";
import { orderModel } from "../../../DB/models/order.model.js";

import Stripe from 'stripe';
const stripe = new Stripe('sk_test_51M6FiXIjUf20zM1DKQHQUeoevfN2Y2TiS0HJzSdJcc4gu5AYarmmHJk8Y5iMH4lEwW1l7bgs7jCqRA4LvROuLHcd00OIA0P6BL');

// cash order option
const createCashOrder = catchAsyncError(async (req, res, next) => {
    //1)  get cart  (carTID)
    const cart = await cartModel.findById(req.params.id);
    //2)  cal total price
    const totalOrderPrice = cart.totalPriceAfterDiscount ?
        cart.totalPriceAfterDiscount : cart.totalPrice
    //3) create order
    const order = new orderModel({
        user: req.user._id,
        cartItems: cart.cartItems,
        totalOrderPrice,
        shippingAddress: req.body.shippingAddress,
        phone:req.body.phone
    })
    await order.save()

    if (order) {
        //4) increment sold & decrement quantity
        let options = cart.cartItems.map(item => ({
            updateOne: {
                filter: { _id: item.product },
                update: { $inc: { quantity: -item.quantity, sold: item.quantity } }
            }
        }))

        await productModel.bulkWrite(options)
        //5) clear user cart
        await cartModel.findByIdAndDelete(req.params.id)

        return res.status(201).json({ message: "success", order })
    } else {
        return next(new AppError('error in cart id', 404))
    }
})

// get specific order
const getSpecificOrder = catchAsyncError(async (req, res, next) => {
    let order = await orderModel.findOne({ user: req.user._id }).populate('cartItems.product')
    res.status(200).json({ message: 'success', order })

})
// get all orders
const getAllOrders = catchAsyncError(async (req, res, next) => {
    let orders = await orderModel.find({}).populate('cartItems.product')
    res.status(200).json({ message: 'success', orders })

})

// checkout order option
const createCheckOutSession = catchAsyncError(async (req, res, next) => {
    //1)  get cart  (carTID)
    const cart = await cartModel.findById(req.params.id);
    if(!cart) return next(new AppError('NO CART FOUND',404))
    //2)  cal total price
    const totalOrderPrice = cart.totalPriceAfterDiscount ?
        cart.totalPriceAfterDiscount : cart.totalPrice

    const { street, city, phone } = req.body.shippingAddress;    
    let session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: 'egp',
                    unit_amount: totalOrderPrice * 100,
                    product_data: {
                        name: req.user.name
                    }
                },
                quantity: 1
            }
        ],
        mode: 'payment',
        success_url: "https://google.com/",// will change
        cancel_url: "https://youtube.com/", // will change
        customer_email: req.user.email,
        client_reference_id: req.params.id,
        shipping_address_collection: {
            allowed_countries: ['EG'], // Specify the allowed countries for shipping
        },
        // shipping_address: {
        //     line1: street,
        //     city,
        //     phone,
        // },
        metadata: req.body.shippingAddress
    })
    res.json({ message: "success", session })
})

export {
    createCashOrder,
    getSpecificOrder,
    getAllOrders,
    createCheckOutSession
}

