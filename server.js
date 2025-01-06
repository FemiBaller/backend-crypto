import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import productRouter from "./routes/productRoute.js";
import adminRouter from "./routes/adminRoute.js";
import 'dotenv/config'

//app config
const app = express()
const port = process.env.PORT || 4000;

//middleware
app.use(express.json())
app.use(cors())

//db connection
connectDB();

//api endpoints
app.use("/api/product", productRouter   

)
app.use("/api/admin",adminRouter)

app.get("/", (req,res) =>{
    res.send("Api is working")
})

app.listen(port,() => {
    console.log(`server started on http://localhost:${port}`)
})



