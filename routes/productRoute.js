import express from "express"
import { addProduct,listProduct ,removeProduct,updateProduct} from "../controllers/productControllers.js"
const productRouter = express.Router();
productRouter.post("/add", addProduct)
productRouter.get("/list", listProduct)
productRouter.post("/remove", removeProduct )
productRouter.put("/update", updateProduct)

export default productRouter