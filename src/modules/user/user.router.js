
import express from "express"
import * as user from "./user.controller.js"


const userRouter = express.Router()

userRouter
    .route('/')
    .get(user.getAllUsers)

userRouter
    .route('/:id')
    .get(user.getUser)
    .put(user.updateUser)
    .delete(user.deleteUser)
userRouter.patch('/changeUserPassword/:id',user.changeUserPassword)

export default userRouter


