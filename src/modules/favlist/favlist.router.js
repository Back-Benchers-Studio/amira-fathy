
import express from "express"
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js"
import { addTofavlist, getUserfavlist, removeFromfavlist } from "./favlist.controller.js"


const favlistRouter = express.Router()
favlistRouter.use(protectedRoutes, allowedTo('user'))
favlistRouter
    .route('/:id')
    .patch(addTofavlist)
    .delete(removeFromfavlist)
    favlistRouter.route('/').get(getUserfavlist);


export default favlistRouter


