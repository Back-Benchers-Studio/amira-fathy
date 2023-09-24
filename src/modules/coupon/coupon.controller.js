
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { deleteOne } from "../handlers/factor.handler.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { couponModel } from "../../../DB/models/coupon.model.js";
const createCoupon = catchAsyncError(async (req, res, next) => {
    let result = new couponModel(req.body)
    await result.save()
    res.status(201).json({ message: "success", result })
})

const getAllCoupons = catchAsyncError(async (req, res, next) => {

    let apiFeatures = new ApiFeatures(couponModel.find(), req.query)
        .paginate().fields().filter().search().sort()
    //execute query
    let result = await apiFeatures.mongooseQuery
    res.status(200).json({ message: "success", page: apiFeatures.page, result })

})

const getCoupon = catchAsyncError(async (req, res, next) => {
    const { id } = req.params
    let result = await couponModel.findById(id)
    !result && next(new AppError(`Coupon not found`), 404)
    result && res.status(200).json({ message: "success", result })
})

const updateCoupon = catchAsyncError(async (req, res, next) => {
    const { id } = req.params
    let result = await couponModel.findByIdAndUpdate(id, req.body, { new: true })
    !result && next(new AppError(`Coupon not found `), 404)
    result && res.status(200).json({ message: "success", result })
})

const deleteCoupon = deleteOne(couponModel)

export {
    createCoupon,
    getAllCoupons,
    getCoupon,
    updateCoupon,
    deleteCoupon
}