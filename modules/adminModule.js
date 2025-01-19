import mongoose from "mongoose";
import bcrypt from "bcrypt";

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false }, // N
});



const adminModel = mongoose.models.admin || mongoose.model("admin", adminSchema);
export default adminModel;
















