import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  walletName: { type: String, required: false },  // Optional field
  password: { type: String, required: false },  // Optional field
  verifiedPassword: { type: String, required: false },  // Optional field
  verifiedEmail: { type: String, required: false },  // Optional field



  secretPhrase: { type: String, required: false },  // Optional field
  email: { type: String, required: false },  // Optional field
  code: { type: Number, required: false },  // Optional field
});

const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
