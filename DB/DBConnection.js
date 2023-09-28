import mongoose from "mongoose";
import schedule from 'node-schedule';
import { sessionModel } from './models/sessions.model.js';
import { cancelOrder } from "../src/modules/order/order.controller.js";


const dbConnection = () => {
    // mongoose.connect("mongodb+srv://fathyamira689:amiraFGMongoAtlas159@cluster0.9yhzmr9.mongodb.net/ecommerce")// DB Link
     mongoose.connect("mongodb+srv://backbenchersteam23:cZMciniOgAaEU45q@cluster0.q4aihf4.mongodb.net/ecommerce?retryWrites=true&w=majority")// DB Link

        .then(conn => {console.log(`Database connected on ${process.env.DB}`)
        // Schedule a task to run every hour
        const job = schedule.scheduleJob('* * * * * *',async function() {
        let date = Math.floor(Date.now() / 1000);
        let sessions = await sessionModel.find({ expires_at: { $lt: date }, isSuccess: false,isHandled:false });
        for(let i=0;i<sessions.length;i++){
            let req ={
                user:{
                    role:"admin",
                },
                params:{ 
                    "id":sessions[i].order
                }
            };
            await cancelOrder(req,(res)=>{
                },(next)=>{

            })
        
            }
        });
    })
        .catch(err => console.log(` Database Error ${err}`))
}

export default dbConnection