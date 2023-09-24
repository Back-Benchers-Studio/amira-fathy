import { userModel } from "../../../DB/models/user.model.js"
import { catchAsyncError } from "../../middleware/catchAsyncError.js"
import { AppError } from "../../utils/AppError.js"

// const addTofavlist = catchAsyncError(async (req, res, next) => {
//     const { product } = req.params.id
//     let result = await userModel.findByIdAndUpdate(req.user._id, { $addToSet: { favlist: product } }, { new: true })
//     !result && next(new AppError(`user not found`), 404)
//     result && res.status(200).json({ message: "success", result:result.favlist })
// })
const addTofavlist = catchAsyncError(async (req, res, next) => {
    const product = req.params.id;
    let result = await userModel.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { favlist: product } },
        { new: true }
    );
    if (!result) {
        return next(new AppError("User not found", 404));
    }
    res.status(200).json({ message: "Success", result: result.favlist });
});


const removeFromfavlist = catchAsyncError(async (req, res, next) => {
    const product  = req.params.id
    let result = await userModel.findByIdAndUpdate(req.user._id, { $pull: { favlist: product } }, { new: true })
    if (!result) {
        return next(new AppError("User not found", 404));
    }
    res.status(200).json({ message: "Success", result: result.favlist });
})

const getUserfavlist = catchAsyncError(async (req, res, next) => {
    let result = await userModel.findById(req.user._id).select('favlist').populate('favlist')
    if (!result) {
        return next(new AppError("User not found", 404));
    }
    res.status(200).json({ message: "Success", result });
})

export {
    addTofavlist,
    removeFromfavlist,
    getUserfavlist
}