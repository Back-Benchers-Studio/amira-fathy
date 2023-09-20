import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { deleteOne } from "../handlers/factor.handler.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { userModel } from './../../../DB/models/user.model.js';


const getAllUsers = catchAsyncError(async (req, res, next) => {

    let apiFeatures = new ApiFeatures(userModel.find(), req.query)
        .paginate().fields().filter().search().sort()
    //execute query
    let result = await apiFeatures.mongooseQuery
    res.status(200).json({ message: "success", page: apiFeatures.page, result })


})

const getUser = catchAsyncError(async (req, res, next) => {
    const { id } = req.params
    let result = await userModel.findById(id)

    !result && next(new AppError(`User not found`), 404)
    result && res.status(200).json({ message: "success", result })
})

const updateUser = catchAsyncError(async (req, res, next) => {
    const { id } = req.params
    let result = await userModel.findByIdAndUpdate(id, req.body, { new: true })
    !result && next(new AppError(`User not found`), 404)
    result && res.status(200).json({ message: "success", result })
})

const deleteUser = deleteOne(userModel)


const changeUserPassword = catchAsyncError(async (req, res, next) => {
    const { id } = req.params

    req.body.passwordChangedAt = Date.now()
    let result = await userModel.findByIdAndUpdate(id, req.body, { new: true })
    !result && next(new AppError(`User not found`), 404)
    result && res.status(200).json({ message: "success", result })
})

export {
    
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    changeUserPassword
}