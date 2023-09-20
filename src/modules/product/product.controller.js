import slugify from "slugify"
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { deleteOne } from "../handlers/factor.handler.js";
import { productModel } from "../../../DB/models/product.model.js";
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
    let result = new productModel(req.body)
    await result.save()
    res.status(201).json({ message: "success", result })
})
// get all products
const getAllProducts = catchAsyncError(async (req, res, next) => {
    let apiFeatures = new ApiFeatures(productModel.find(), req.query)
        .paginate().fields().filter().search().sort()
    //execute query
    let result = await apiFeatures.mongooseQuery
    res.status(200).json({ message: "success", page: apiFeatures.page, result })
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