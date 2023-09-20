import jwt from "jsonwebtoken"
import { userModel } from "../../../DB/models/user.model.js";
import { AppError } from "../../utils/AppError.js";
import bcrypt from 'bcrypt'
import { catchAsyncError } from "../../middleware/catchAsyncError.js";

export const signup = catchAsyncError(async (req, res, next) => {
    let isFound = await userModel.findOne({ email: req.body.email })
    if (isFound) return next(new AppError('email already exists', 409))
    let user = new userModel(req.body)
    await user.save()
    res.json({ message: "success", user })
})



export const signIn = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body
    let isFound = await userModel.findOne({ email })
    const match = await bcrypt.compare(password, isFound.password);
    if (isFound && match) {
        let token = jwt.sign({ name: isFound.name, userId: isFound._id, role: isFound.role }, process.env.JWT_KEY)
        return res.json({ message: "success", token })
    }
    next(new AppError('incorrect email or password', 401))
})


export const protectedRoutes = catchAsyncError(async (req, res, next) => {

    let { token } = req.headers
    if (!token) return next(new AppError('token not provided', 401))

    let decoded = await jwt.verify(token,process.env.JWT_KEY)

    let user = await userModel.findById(decoded.userId)
    if (!user) return next(new AppError('user not found', 401))

    if (user.passwordChangedAt) {
        let changePasswordDate = parseInt(user.passwordChangedAt.getTime() / 1000)
        if (changePasswordDate > decoded.iat) return next(new AppError('password changed', 401))
    }

    req.user = user
    next()

})

// to handle Authorization

export function allowedTo(...roles) {
    return catchAsyncError(async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('you are not authorized to access this route. u are ' + req.user.role))
        }
        next()
    })
}



