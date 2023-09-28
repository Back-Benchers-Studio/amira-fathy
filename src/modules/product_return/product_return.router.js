
import express from "express"
import * as product_return from "./product_return.controller.js"
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js"


const product_returnRouter = express.Router()

// product_returnRouter
//     .route('/')
//     .get(review.getAllReviews)

product_returnRouter
    .route('/:id')
    .post(protectedRoutes, allowedTo('user'), product_return.applyReturn)
    // .get(review.getReview)
    // .put(protectedRoutes, allowedTo('user'), review.updateReview)
    // .delete(protectedRoutes, allowedTo('admin', 'user'), review.deleteReview)

export default product_returnRouter


