import mongoose from "mongoose";


const dbConnection = () => {
    mongoose.connect("mongodb+srv://backbenchersteam23:cZMciniOgAaEU45q@cluster0.q4aihf4.mongodb.net/ecommerce?retryWrites=true&w=majority")// DB Link
        .then(conn => console.log(`Database connected on ${process.env.DB}`))
        .catch(err => console.log(` Database Error ${err}`))
}

export default dbConnection
