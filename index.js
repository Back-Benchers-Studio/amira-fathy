import express from 'express'
import dotenv from "dotenv"
import morgan from "morgan";
import dbConnection from './DB/DBConnection.js'
import { init } from './src/modules/index.routes.js';
import Stripe from 'stripe';
const stripe = new Stripe('sk_test_51M6FiXIjUf20zM1DKQHQUeoevfN2Y2TiS0HJzSdJcc4gu5AYarmmHJk8Y5iMH4lEwW1l7bgs7jCqRA4LvROuLHcd00OIA0P6BL');

import cors from "cors"
import { userModel } from './DB/models/user.model.js';
import { cartModel } from './DB/models/cart.model.js';
import { productModel } from './DB/models/product.model.js';
import { orderModel } from './DB/models/order.model.js';
dotenv.config()
const app = express()
const port = 3000
//middleware
app.use(cors())
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    // console.log(req.body);
    const signature = req.headers['stripe-signature'].toString();
    console.log(signature);
    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            "whsec_cVvGsj3dDoyMiYLzO5Y1ztEZyV15mTM0"
        );
    } catch (err) {
        console.log(err);
        return res.status(400).send(`Webhook error: ${err.message}`);
    }

    // Handle the event
    if (event.type == "checkout.session.completed") {
        const myObj = event.data.object;
        //1)  get cart  (carTID)
        const cart = await cartModel.findById(myObj.client_reference_id);
        let { _id } = await userModel.findOne({ email: myObj.customer_email })
        //2)  cal total price
        const totalOrderPrice = cart.totalPriceAfterDiscount ?
            cart.totalPriceAfterDiscount : cart.totalPrice
        //3) create order
        const order = new orderModel({
            user: _id,
            cartItems: cart.cartItems,
            totalOrderPrice,
            shippingAddress: myObj.metadata,
            isPaid: true,
            paidAt: Date.now(),
            paymentMethod: "card"
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
            await cartModel.findByIdAndDelete(cart._id)

            return res.status(201).json({ message: "success", order })
        } else {
            return next(new AppError('error in cart id', 404))
        }
        console.log("create order here...");
    } else {
        console.log(`Unhandled event type ${event.type}`);
    }

    // // Return a 200 response to acknowledge receipt of the event
    // res.status(200).json({message:"success"});
});
app.use(express.json())
app.use(express.static('uploads'))
if (process.env.MODE == 'development') {
    app.use(morgan('dev'))
}



init(app)
dbConnection()
app.listen(process.env.PORT || port, () => console.log(`Example app listening on port ${port}!`))