
import express from "express"
import * as product from "./product.controller.js"
import { uploadMixOfFile } from "../../middleware/fileUpload.js"
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js"

const productRouter = express.Router()
let arrayOfFields = [{ name: 'imgCover', maxCount: 1 }, { name: 'images', maxCount: 10 }]// Max count images can you upload for one product 
productRouter
    .route('/')
    .post(protectedRoutes, allowedTo('admin'),uploadMixOfFile(arrayOfFields, 'product'), product.createProduct)
    .get(product.getAllProducts)

productRouter
    .route('/:id')
    .get(product.getProduct)
    .put(protectedRoutes, allowedTo('admin'),product.updateProduct)
    .delete(protectedRoutes, allowedTo('admin'),product.deleteProduct)
    .post(protectedRoutes,allowedTo('admin'),product.setCompatibility)


export default productRouter


