import express from "express";
import { loginAdmin, registerAdmin, changePassword, verifyEmail,authenticate, sendValidationEmail } from "../controllers/adminController.js";

const adminRouter = express.Router();

// Route for registering a new admin
adminRouter.post("/register", registerAdmin);

// Route for logging in an admin
adminRouter.post("/login", loginAdmin);

// Route for changing an admin's password
adminRouter.post("/change-password", changePassword);

// Route for verifying email
adminRouter.get("/verify-email/:token", verifyEmail);

adminRouter.post("/send-validation-email", authenticate, sendValidationEmail);


export default adminRouter;
