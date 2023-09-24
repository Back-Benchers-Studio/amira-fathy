
import express, { Router } from "express"
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js"
import { createCoupon, deleteCoupon, getAllCoupons, getCoupon, updateCoupon } from "./coupon.controller.js";


const couponRouter = express.Router()
// Router.use(protectedRoutes, allowedTo('admin'));
couponRouter
    .route('/')
    .post(protectedRoutes, allowedTo('admin'),createCoupon)// For Now i assume that admin will create coupon code 
    .get(protectedRoutes, allowedTo('admin'),getAllCoupons)

couponRouter
    .route('/:id')
    .get(protectedRoutes, allowedTo('admin'),getCoupon)
    .put(protectedRoutes, allowedTo('admin'),updateCoupon)
    .delete(protectedRoutes, allowedTo('admin'),deleteCoupon)

export default couponRouter


