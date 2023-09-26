
import express from "express"
import * as review from "./review.controller.js"
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js"


const reviewRouter = express.Router()

reviewRouter
    .route('/')
    .get(review.getAllReviews)

reviewRouter
    .route('/:id')
    .post(protectedRoutes, allowedTo('user'), review.createReview)
    .get(review.getReview)
    .put(protectedRoutes, allowedTo('user'), review.updateReview)
    .delete(protectedRoutes, allowedTo('admin', 'user'), review.deleteReview)

export default reviewRouter


