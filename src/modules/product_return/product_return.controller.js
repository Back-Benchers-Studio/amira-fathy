import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { product_returnModel } from '../../../DB/models/product_return.model.js'
import { orderModel } from '../../../DB/models/order.model.js'

const applyReturn = catchAsyncError(async (req, res, next) => {
    let AllowedReturnTime = 7 * (24*60*60);

    let order = await orderModel.findById(req.params.id);
    if(!order){
        return next(new AppError('Order not found', 404));
    }
    if(order.user.toString()!=req.user._id.toString()){
        return next(new AppError('This order is not for this user', 403));
    }
    if(order.status !== 'received'){
        return next(new AppError('You have to receive order first', 400));
    }
    let isReturn = await product_returnModel.findOne({orderId:req.params.id});
    if(isReturn){
        return next(new AppError('You already applied for return', 400));
    }
    let time = Math.floor(Date.now() / 1000);

    if(order.deliveredAt + AllowedReturnTime  < time){
        return next(new 
            AppError('You cannot apply for return after 7 days of receiving order', 400));
    }

    let returnObj = new product_returnModel({
        orderId: req.params.id,
        reason: req.body.reason
    })

    await returnObj.save();
    res.status(201).json({ message: "success", returnObj })




})

export {
    applyReturn
}