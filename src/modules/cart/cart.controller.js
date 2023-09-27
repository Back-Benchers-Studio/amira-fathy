
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { cartModel } from "../../../DB/models/cart.model.js";
import { productModel } from "../../../DB/models/product.model.js";
import { couponModel } from "../../../DB/models/coupon.model.js";

// to calculate the price of items in the cart
function calcTotalPrice(cart) {
    let totalPrice = 0;
    cart.cartItems.forEach(elm => {
        // totalPrice += elm.quantity * elm.price
        totalPrice += elm.price

    })
    cart.totalPrice = cart.quantity * totalPrice
}


const addProductToCartNew = catchAsyncError(async (req, res, next) => {
    const requestedQuantity =  1;

    // check if product exists
    const product = await productModel.findById(req.body.product).select('price quantity');
    if (!product) {
        return next(new AppError('Product not found', 404));
    }
    // // quantity restriction
    // if (requestedQuantity <= 0) {
    //     return next(new AppError('Invalid quantity', 400));
    // }
    // if (product.quantity < requestedQuantity) {
    //     return next(new AppError('Insufficient stock quantity', 400));
    // }
    const price = product.price;

    // Check if cart exists for the user
    let isCartExist = await cartModel.findOne({ user: req.user._id });

    if (!isCartExist) {
        // Create a new cart if it doesn't exist
        let cart = new cartModel({
            user: req.user._id,
            cartItems: [{ product: req.body.product, price }],
        });
        calcTotalPrice(cart)
        await cart.save()
       return res.status(201).json({ message: "success", cart })
    }
    let isFound= false;
    
    let bodyCategory = await productModel.findById(req.body.product).select('category quantity price _id');
    if(bodyCategory.quantity < isCartExist.quantity){
        return next(new AppError('Insufficient stock quantity', 400));
    }

    for(let i=0;i<isCartExist.cartItems.length;i++){
        let elmCategory =  await productModel.findById(isCartExist.cartItems[i].product).select('category');

        if (elmCategory.category.toString() == bodyCategory.category.toString()) {   

            console.log("hereeee")
            req.body.category = bodyCategory.category;
            req.body.price = bodyCategory.price;
            req.body._id = bodyCategory._id;

            isCartExist.cartItems[i] = req.body;

         
            isFound = true;
            break;
        }

    }
    console.log(isFound);

    if(!isFound){
        req.body.category = bodyCategory.category;
        req.body.price = bodyCategory.price;
        req.body._id = bodyCategory._id;
        isCartExist.cartItems.push(req.body)
    }

    console.log(isCartExist.cartItems);
    // if (item) {
    //     // item.quantity += req.body.quantity || 1
    //     if(item.category != req.body.category){
    //         isCartExist.cartItems.push(req.body)
    //     }else{

    //     }
    // }
    //  else {
    //     isCartExist.cartItems.push(req.body)
    // }

    
    calcTotalPrice(isCartExist)
    if (isCartExist.discount) {

        isCartExist.totalPriceAfterDiscount = isCartExist.totalPrice - (isCartExist.totalPrice * isCartExist.discount) / 100
    }
    await isCartExist.save();
    res.status(201).json({ message: "Added to cart", isCartExist });
});


// const addProductToCart = catchAsyncError(async (req, res, next) => {
//     let product = await productModel.findById(req.body.product).select('price')
//     if (!product) return next(new AppError('product not found', 404))
//     req.body.price = product.price
//     let isCartExist = await cartModel.findOne({ user: req.user._id })
//     if (!isCartExist) {
//         let cart = new cartModel({
//             user: req.user._id,
//             cartItems: [req.body],
//         })
//         calcTotalPrice(cart)
//         await cart.save()
//         return res.status(201).json({ message: "success", cart })
//     }

//     let item = isCartExist.cartItems.find(elm => elm.product == req.body.product)
//     if (item) {
//         item.quantity += req.body.quantity || 1
//     } else {
//         isCartExist.cartItems.push(req.body)
//     }
//     calcTotalPrice(isCartExist)
//     if (isCartExist.discount) {

//         isCartExist.totalPriceAfterDiscount = isCartExist.totalPrice - (isCartExist.totalPrice * isCartExist.discount) / 100
//     }

//     await isCartExist.save()
//     res.status(201).json({ message: "added to cart", cart: isCartExist })

// })


// remove item from cart
const removeProductFromCart = catchAsyncError(async (req, res, next) => {
    let result = await cartModel.findOneAndUpdate({ user: req.user._id }, { $pull: { cartItems: { _id: req.params.id } } }, { new: true })
    !result && next(new AppError(`item not found`), 404)
    calcTotalPrice(result)
    if (result.discount) {

        result.totalPriceAfterDiscount = result.totalPrice - (result.totalPrice * result.discount) / 100
    }

    result && res.status(200).json({ message: "success", cart: result })
})

// update item quantity 
const updateQuantity = catchAsyncError(async (req, res, next) => {
    const requestedQuantity = req.body.quantity;
    //  check if product exists
    // const product = await productModel.findById(req.params.id).select('price quantity');
    // if (!product) {
    //     return next(new AppError('Product not found', 404));
    // }

    if (requestedQuantity <= 0) {
        return next(new AppError('Invalid quantity', 400));
    }
    // if (product.quantity < requestedQuantity) {
    //     return next(new AppError('Insufficient stock quantity', 400));
    // }

    let isCartExist = await cartModel.findOne({ user: req.user._id });

    if (!isCartExist) {
        return next(new AppError('Cart not found', 404));
    }
    // Find the cart item for the specified product that you want to edit the quantity
    // let item = isCartExist.cartItems.find((elm) => elm.product.toString() === req.params.id);
    

    for(let i=0;i<isCartExist.cartItems.length;i++){
        const product = await productModel.findById(isCartExist.cartItems[i].product._id).select('price quantity');
        if(product.quantity < requestedQuantity){
            return next(new AppError('Insufficient stock quantity', 400));
        }
    }

    // isCartExist.cartItems.find(async (elm) => {

    //     // elm.quantity = requestedQuantity
    // })

    isCartExist.quantity = requestedQuantity;
    // if (!item) {
    //     return next(new AppError('Product not found in cart', 404));
    // }
    // Update the product quantity 
    // item.quantity = requestedQuantity;
    calcTotalPrice(isCartExist);
    if (isCartExist.discount) {
        isCartExist.totalPriceAfterDiscount = isCartExist.totalPrice - (isCartExist.totalPrice * isCartExist.discount) / 100;
    }
    await isCartExist.save();

    res.status(200).json({ message: 'Quantity updated successfully', cart: isCartExist });
});


// apply coupon on cart
const applyCoupon = catchAsyncError(async (req, res, next) => {
    let coupon = await couponModel.findOne({ code: req.body.code, expires: { $gt: Date.now() } })
    if (!coupon) {
        return next(new AppError('Invalid coupon code or expired', 400));
    }
    const userId = req.user._id;

    let cart = await cartModel.findOne({ user: userId })
    if (!cart) {
        return next(new AppError('Cart not found', 404));
    }
    // Check if the user has already used the coupon
    // const isCouponUsed = coupon.usedBy.includes(userId);
    const isCouponUsed = await couponModel.findOne({ _id: coupon._id, usedBy: { $nin: [userId] } });
    if (!isCouponUsed) {
        return next(new AppError('You have already used this coupon code', 400));
    }
    cart.totalPriceAfterDiscount = cart.totalPrice - (cart.totalPrice * coupon.discount) / 100
    cart.discount = coupon.discount
    //coupon.usedBy.push(userId);
    await cart.save()
    await couponModel.findByIdAndUpdate({ _id: coupon._id }, { $addToSet: { usedBy: userId } });
    //await coupon.save();
    res.status(201).json({ message: "Coupon applied successfully", cart })


})
// to get cart items for current logged user
const getLoggedUserCart = catchAsyncError(async (req, res, next) => {
    let cartItems = await cartModel.findOne({ user: req.user._id }).populate('cartItems.product')
    res.status(201).json({ message: "success", cart: cartItems })

})

export {
    addProductToCartNew,
    removeProductFromCart,
    updateQuantity,
    applyCoupon,
    getLoggedUserCart

}

