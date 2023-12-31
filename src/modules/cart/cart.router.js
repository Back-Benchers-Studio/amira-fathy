
import express from "express"
import * as cart from "./cart.controller.js"
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js"
const cartRouter = express.Router()

cartRouter
    .route('/')
    .post(protectedRoutes, allowedTo('user'), cart.addProductToCartNew)
    .get(protectedRoutes, allowedTo('user'), cart.getLoggedUserCart)

cartRouter.post('/applyCoupon', protectedRoutes, allowedTo('user'), cart.applyCoupon)



cartRouter
    .route('/:id')
    .delete(protectedRoutes, allowedTo('user'), cart.removeProductFromCart)
    // .put(protectedRoutes, allowedTo('user'), cart.updateQuantity)

cartRouter.route('/updatequantity').post(protectedRoutes, allowedTo('user'), cart.updateQuantity)


export default cartRouter


