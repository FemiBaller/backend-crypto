import adminModel from "../modules/adminModule.js";
import jwt from "jsonwebtoken";
import bycrypt from "bcrypt";
import validator from "validator";

///login admin

const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
      const admin = await adminModel.findOne({ email });
      if (!admin) {
        return res.json({ success: false, message: "admin does not exist" });
      }
      const isMatch = await bycrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.json({ success: false, message: "Invalid Credentials" });
      }
      const token = createToken(admin._id);
      res.json({ success: true, token });
    } catch (error) {
      console.log(error);
      res.json({ success: false });
    }
  };
  const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
  };
  

//register admin
const registerAdmin = async (req, res) => {
  const { name, password, email } = req.body;
  try {
    const exists = await adminModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "admin already exists" });
    }
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid Email" });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: "Enter a strong password" });
    }
    const salt = await bycrypt.genSalt(10);
    const hashedPassword = await bycrypt.hash(password, salt);
    const newAdmin = new adminModel({
      name: name,
      email: email,
      password: hashedPassword,
    });
    const admin = await newAdmin.save();
    const token = createToken(admin._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Change Password
const changePassword = async (req, res) => {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;
  
    try {
      // Validate input
      if (newPassword !== confirmPassword) {
        return res.json({ success: false, message: "New password and confirm password do not match" });
      }
      if (newPassword.length < 8) {
        return res.json({ success: false, message: "Password must be at least 8 characters long" });
      }
  
      // Find admin by email
      const admin = await adminModel.findOne({ email });
      if (!admin) {
        return res.json({ success: false, message: "Admin does not exist" });
      }
  
      // Check old password
      const isMatch = await bycrypt.compare(oldPassword, admin.password);
      if (!isMatch) {
        return res.json({ success: false, message: "Old password is incorrect" });
      }
  
      // Hash new password and update
      const salt = await bycrypt.genSalt(10);
      const hashedNewPassword = await bycrypt.hash(newPassword, salt);
      admin.password = hashedNewPassword;
      await admin.save();
  
      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error changing password" });
    }
  };
export { loginAdmin, registerAdmin, changePassword};












