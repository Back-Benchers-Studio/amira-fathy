import { globalErrorHandling } from "../middleware/globalErrorHandling.js"
import { AppError } from "../utils/AppError.js"
import authRouter from "./auth/auth.router.js"
import cartRouter from "./cart/cart.router.js"
import orderRouter from "./order/order.router.js"
import productRouter from "./product/product.router.js"
import userRouter from "./user/user.router.js"
import favlistRouter from "./favlist/favlist.router.js"
import couponRouter from "./coupon/coupon.router.js"
import reviewRouter from "./review/review.router.js"
import categoryRouter from "./category/category.router.js"
import sessionRouter from "./session/session.router.js"
export function init(app) {
    app.use('/api/v1/products', productRouter)
    app.use('/api/v1/users', userRouter)
    app.use('/api/v1/auth', authRouter)
    app.use('/api/v1/carts', cartRouter)
    app.use('/api/v1/orders', orderRouter)
    app.use('/api/v1/favlist', favlistRouter)
    app.use('/api/v1/coupon', couponRouter)
    app.use('/api/v1/reviews', reviewRouter)
    app.use('/api/v1/categories', categoryRouter)
    app.use('/api/v1/session', sessionRouter)
    app.all('*', (req, res, next) => {
        next(new AppError(`can't find this route: ${req.originalUrl}`), 404)
    })
    //global error handling middleware
    app.use(globalErrorHandling)
}