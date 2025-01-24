import express from "express";
import {
  loginAdmin,
  registerAdmin,
  changePassword,
  verifyEmail,
  notifyCustomerToResubmit // Import the new controller function
} from "../controllers/adminController.js";

const adminRouter = express.Router();

// Route for registering a new admin
adminRouter.post("/register", registerAdmin);

// Route for logging in an admin
adminRouter.post("/login", loginAdmin);

// Route for changing an admin's password
adminRouter.post("/change-password", changePassword);

// Route for verifying email
adminRouter.get("/verify-email/:token", verifyEmail);

// Route for sending a resubmit request email to customers
adminRouter.post("/send-resubmit-request", notifyCustomerToResubmit);

export default adminRouter;
