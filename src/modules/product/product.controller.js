import slugify from "slugify"
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { deleteOne } from "../handlers/factor.handler.js";
import { productModel } from "../../../DB/models/product.model.js";
import { categoryModel } from "../../../DB/models/category.model.js";

import { ApiFeatures } from "../../utils/ApiFeatures.js";

// add product
const createProduct = catchAsyncError(async (req, res, next) => {
    console.log(req.files);

    // let imgs = []
    // req.body.slug = slugify(req.body.title)
    // req.body.imgCover = req.files.imgCover[0].filename
    // req.files.images.forEach((img) => {
    //     imgs.push(img.filename)
    // })
    // req.body.images=imgs
    
    req.body.slug = slugify(req.body.title)
    let category =  await categoryModel.find({"name":`${req.body.category}`}).select('_id')
    req.body.category  = category[0]._id;
    console.log(category[0]._id);
    let result = new productModel(req.body)
    await result.save()
    res.status(201).json({ message: "success", result })
})
// get all products
const getAllProducts = catchAsyncError(async (req, res, next) => {
    let apiFeatures = new ApiFeatures(productModel.find().populate([{ path: 'review' }]),
    req.query)
        .paginate()
        .fields()
        .filter()
        .search()
        .sort()
    //execute query
    // let result = await apiFeatures.mongooseQuery
    // console.log(result);

    const products = await apiFeatures.mongooseQuery
    let avg = 0
    let calc = 0
    for (const product of products) {
      if (product.review) {
        for (const review of product.review) {
          console.log(review.ratings)
          avg += review.ratings
        }
        calc = avg / product.review.length
        product.ratingAvg = Number.parseFloat(calc).toFixed(2)
        await product.save()
      }
      product.ratingAvg = 1
      await product.save()
    }
    res.status(200).json({ message: "success", page: apiFeatures.page, products })
})
// get specific product
const getProduct = catchAsyncError(async (req, res, next) => {
    const { id } = req.params
    let result = await productModel.findById(id)

    !result && next(new AppError(`Product not found`), 404)
    result && res.status(200).json({ message: "success", result })
})
// update product
const updateProduct = catchAsyncError(async (req, res, next) => {
    const { id } = req.params
    if (req.body.title) req.body.slug = slugify(req.body.title)

    let result = await productModel.findByIdAndUpdate(id, req.body, { new: true })

    !result && next(new AppError(`Product not found`), 404)
    result && res.status(200).json({ message: "success", result })
}
)
// delete product
const deleteProduct = deleteOne(productModel)

export {
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct
}