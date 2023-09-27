import { sessionModel } from "../../../DB/models/sessions.model.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { orderModel } from "../../../DB/models/order.model.js";
import Stripe from 'stripe';
const stripe = new Stripe(`${process.env.STRIPE_KEY}`);


const handleSession = catchAsyncError(async (req, res, next) => {

    let sessionStripe = await stripe.checkout.sessions.retrieve(req.query.session_id,{
        // Pass the API key in the Authorization header
        apiKey: process.env.STRIPE_KEY,
    });
    //Check if session is paid
    if(sessionStripe.payment_status !== 'paid'){
        return next(new AppError('Session is not paid',400))
    }
    
    let sessionMongo = await sessionModel.findOne({session_id:sessionStripe.id}).select('isSuccess intent');
    if(!sessionMongo){
        return next(new AppError('Session not found',404))
    }

    if(sessionMongo.isSuccess){
        return res.status(200).json({ message: 'success'})
    }

    // change isSuccess to true
    sessionMongo.isSuccess = true;
    sessionMongo.intent = sessionStripe.payment_intent;
    await sessionMongo.save();

    //update order status
    let ordermodel = await orderModel.findById(sessionStripe.client_reference_id);
    ordermodel.status = 'placed';
    ordermodel.paidAt = Date.now();
    ordermodel.isPaid = true;
    // ordermodel.intent = sessionStripe.payment_intent;
    await ordermodel.save();

    console.log(sessionStripe);
    res.status(200).json({ message: 'success'})
})

export {
    handleSession
}