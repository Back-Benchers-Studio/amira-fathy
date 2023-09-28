
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { cartModel } from "../../../DB/models/cart.model.js";
import { productModel } from "../../../DB/models/product.model.js";
import { orderModel } from "../../../DB/models/order.model.js";
import { categoryModel } from "../../../DB/models/category.model.js";
import { sessionModel } from "../../../DB/models/sessions.model.js";
import { refundModel } from "../../../DB/models/refund.model.js";


import Stripe from 'stripe';
const stripe = new Stripe(`${process.env.STRIPE_KEY}`);


const createOrder = catchAsyncError(async (req, res, next) =>{
    if(req.body.paymentMethod === 'card'){
        createCheckOutSession(req, res, next);
    }else if (req.body.paymentMethod === 'cash'){
        createCashOrder(req, res, next);
    }else{
        return next(new AppError('Invalid payment method', 400));
    }
})

// cash order option
const createCashOrder = catchAsyncError(async (req, res, next) => {
    //1)  get cart  (carTID)
    const cart = await cartModel.findOne({user:req.user._id});  
    if(!cart) return next(new AppError('NO CART FOUND',404))
 
    //Check if all categories in the cart
    const category = await categoryModel.find({});
    if(category.length !== cart.cartItems.length){
        return next(new AppError('Please add all categories to the cart', 400));
    }
    
    //check if stock still available
    for(let i=0; i<cart.cartItems.length; i++){
        const product = await productModel.findById(cart.cartItems[i].product);
        if(product.quantity < cart.quantity){
            return next(new AppError(`Insufficient stock quantity for ${product.title}`, 400));
        }
    }

    //2)  cal total price
    const totalOrderPrice = cart.totalPriceAfterDiscount ?
        cart.totalPriceAfterDiscount : cart.totalPrice

    //3) create order
    const order = new orderModel({
        user: req.user._id,
        cartItems: cart.cartItems,
        totalOrderPrice,
        shippingAddress: req.body.shippingAddress,
        phone:req.body.phone,
        quantity:cart.quantity,
        deliveredAt: Math.floor(Date.now() / 1000),
    })
    await order.save()

    if (order) {
        //4) increment sold & decrement quantity
        let options = cart.cartItems.map(item => ({
            updateOne: {
                filter: { _id: item.product },
                update: { $inc: { quantity: -cart.quantity, sold: cart.quantity } }
            }
        }))

        await productModel.bulkWrite(options)

        //5) clear user cart
        await cartModel.findOneAndDelete({user:req.user._id})

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
    const cart = await cartModel.findOne({user:req.user._id});
    if(!cart) return next(new AppError('NO CART FOUND',404))

    //Check if all categories in the cart
    const category = await categoryModel.find({});
    if(category.length !== cart.cartItems.length){
        return next(new AppError('Please add all categories to the cart', 400));
    }
    
    for(let i=0; i<cart.cartItems.length; i++){
        const product = await productModel.findById(cart.cartItems[i].product);
        if(product.quantity < cart.quantity){
            return next(new AppError(`Insufficient stock quantity for ${product.title}`, 400));
        }
    }

    //2)  cal total price
    const totalOrderPrice = cart.totalPriceAfterDiscount ?
    cart.totalPriceAfterDiscount : cart.totalPrice

    //3) create order
    const order = new orderModel({
        user: req.user._id,
        cartItems: cart.cartItems,
        totalOrderPrice,
        paymentMethod:'card',
        shippingAddress: req.body.shippingAddress,
        phone:req.body.phone,
        deliveredAt: Math.floor(Date.now() / 1000),
        
    })
    let orderID=null;
    await order.save().then((order)=>{
        orderID=order._id.toString();

    })
    if (!order){
        return next(new AppError('error in cart id', 404))
    }

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
                quantity: cart.quantity//cart  quantity 
            }
        ],
        mode: 'payment',
        success_url: "http://localhost:3000/api/v1/session/?session_id={CHECKOUT_SESSION_ID}",// will change
        customer_email: req.user.email,
        client_reference_id: orderID,
        shipping_address_collection: {
            allowed_countries: ['EG'], // Specify the allowed countries for shipping
        },
        
        metadata: {shippingAdress:req.body.shippingAddress,
            phone:req.body.phone
        }
    },{
        // Pass the API key in the Authorization header
        apiKey: process.env.STRIPE_KEY,
    })

    if(!session){
        return next(new AppError('Error Creating Session', 404));
    }

        //4) increment sold & decrement quantity
        let options = cart.cartItems.map(item => ({
            updateOne: {
                filter: { _id: item.product },
                update: { $inc: { quantity: -cart.quantity, sold: cart.quantity } }
            }
        }))
            await productModel.bulkWrite(options)
        //5) clear user cart
        await cartModel.findOneAndDelete({user:req.user._id})

    let sessionmodel = new sessionModel({
        session_id: session.id,
        order: orderID,
        user: req.user._id,
        expires_at: session.expires_at,
    })
    await sessionmodel.save();
    console.log(session.payment_intent);

    res.json({ message: "success", session })
})

//cancel order
const cancelOrder = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const order = await orderModel.findById(id);
    if(!order){
        return next(new AppError('Order not found', 404));
    }
    if(req.user.role !== 'admin'){
        if(order.user.toString() !== req.user._id.toString()){
            return next(new AppError('This order is not for this user', 403));
        }
    }

    if(order.status === 'cancelled'){
        return next(new AppError('Order already cancelled', 400));
    }
    if(order.status === 'recieved' || order.status === 'returned'){
        return next(new AppError('Cannot cancel recieved or returned product', 400));
    }

    //increment quantity and decrement sold
    if(order.paymentMethod === 'card'){
        let session = await sessionModel.findOne({order:order._id}).select('isSuccess intent');
        if(!session){
            return next(new AppError('Session not found', 404));
        }
        if(session.isSuccess){
        
            const refund = await stripe.refunds.create({
                payment_intent: session.intent,
              },{
                // Pass the API key in the Authorization header
                apiKey: process.env.STRIPE_KEY,
            });

            let refundobj = new refundModel({
                paymentIntent: session.intent,
                orderId: order._id,
                RefundObject: {refund}.refund,
            })
            await refundobj.save();

        }
        session.isHandled = true;
        await session.save();

    }

    let options = order.cartItems.map(item => ({
        updateOne: {
            filter: { _id: item.product },
            update: { $inc: { quantity: order.quantity, sold: -order.quantity } }
        }
    }))  
    await productModel.bulkWrite(options)

    order.status = 'cancelled';
    await order.save();



    res.status(200).json({ message: 'Order was cancelled successfully'});
})


export {
    createCashOrder,
    getSpecificOrder,
    getAllOrders,
    createCheckOutSession,
    cancelOrder,
    createOrder,
}

