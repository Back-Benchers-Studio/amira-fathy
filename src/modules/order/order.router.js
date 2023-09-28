
import express from "express"
import * as order from "./order.controller.js"
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js"
const orderRouter = express.Router()

orderRouter
    .route('/')
    .get(protectedRoutes, allowedTo('user'), order.getSpecificOrder)
orderRouter.get('/all', order.getAllOrders)


// cash order option
orderRouter
    .route('/')
    // .post(protectedRoutes, allowedTo('user'), order.createCashOrder)
    .post(protectedRoutes, allowedTo('user'), order.createOrder)

    .put(protectedRoutes, order.cancelOrder)



// checkout order option
// orderRouter.post('/checkOut/:id', protectedRoutes, allowedTo('user'), order.createCheckOutSession)



export default orderRouter


