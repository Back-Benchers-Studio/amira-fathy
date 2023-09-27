
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { deleteOne } from "../handlers/factor.handler.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { reviewModel } from "../../../DB/models/review.model.js";
import { orderModel } from "../../../DB/models/order.model.js";
// const createReview = catchAsyncError(async (req, res, next) => {
//     req.body.user = req.user._id
//     const {productId}=req.params;

//     let isReview = await reviewModel.findOne({ user: req.user._id, product: productId })
//     if (isReview) {
//     return next(new AppError('Already reviewed before ', 409))
//     }
//     let result = new reviewModel(req.body)
//     await result.save()
//     res.status(201).json({ message: "success", result })
// })


const createReview = catchAsyncError(async (req, res, next) => {
    const productId  = req.params.id;
    // req.body.user = req.user._id;
    // Check if the user has already reviewed the product
    const isReview = await reviewModel.findOne({ user: req.user._id, product: productId });
    if (isReview) {
        return next(new AppError('Already reviewed before', 409));
    }
    // Check if the user has created an order with the product and its status is received
    const order = await orderModel.findOne({
        user: req.user._id,
         "cartItems.product": productId,
         status: 'recieved'
    })

    console.log(order)

    if (!order) {
        return next(new AppError('Sorry,You cannot review this product.Only shipped products can be reviewed', 403));
    }
    const review = await reviewModel.create({
        comment: req.body.comment,
        product: productId,
        user: req.user._id,
        ratings: req.body.ratings
    });
    // const calculateRatingAvg = async () => {
    //     const result = await productModel.aggregate([
    //         {
    //             $lookup: {
    //                 from: 'reviews',
    //                 localField: '_id',
    //                 foreignField: 'product',
    //                 as: 'reviews'
    //             }
    //         },
    //         {
    //             $group: {
    //                 _id: '$_id',
    //                 ratingAvg: { $avg: '$reviews.ratings' }
    //             }
    //         }
    //     ]);
    
    //     // Update the ratingAvg field for each product
    //     for (const { _id, ratingAvg } of result) {
    //         await productModel.findByIdAndUpdate(_id, { ratingAvg });
    //     }
    // };
    
    // // Call the function to calculate the ratingAvg
    // calculateRatingAvg();



    res.status(201).json({ message: 'Successfully Review', review });
});

const getAllReviews = catchAsyncError(async (req, res, next) => {

    let apiFeatures = new ApiFeatures(reviewModel.find(), req.query)
        .paginate().fields().filter().search().sort()
    //execute query
    let result = await apiFeatures.mongooseQuery
    res.status(200).json({ message: "success", page: apiFeatures.page, result })

})

const getReview = catchAsyncError(async (req, res, next) => {
    const { id } = req.params
    let result = await reviewModel.findById(id)
    !result && next(new AppError(`Review not found`), 404)
    result && res.status(200).json({ message: "success", result })
})

const updateReview = catchAsyncError(async (req, res, next) => {
    const { id } = req.params
    let result = await reviewModel.findOneAndUpdate({ _id: id, user: req.user._id }, req.body, { new: true })
    !result && next(new AppError(`Review not found or you are not authorized to perform this action`), 404)
    result && res.status(200).json({ message: "success", result })
})

const deleteReview = deleteOne(reviewModel)

export {
    createReview,
    getAllReviews,
    getReview,
    updateReview,
    deleteReview
}