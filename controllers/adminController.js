import adminModel from "../modules/adminModule.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import nodemailer from "nodemailer";
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';  // Import dotenv
dotenv.config(); // Load environment variables

// Password validation function
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Rate limiting middleware for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 requests per windowMs
  message: "Too many login attempts, please try again later.",
});

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // 'Bearer <token>'
  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid or expired token" });
  }
};

// Generate a JWT token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" }); // Token expiration time
};

// Send email with reset password link
const sendResetPasswordEmail = async (email) => {
  const admin = await adminModel.findOne({ email });
  if (!admin) {
    throw new Error("Admin not found");
  }
  
  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  
  const transporter = nodemailer.createTransport({
    service: "Gmail", // or your preferred email provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Your Password",
    html: `
      <h2>Hello, ${admin.name}!</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Register admin
const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the admin already exists
    const existingAdmin = await adminModel.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: "Admin already exists" });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long and contain at least one number" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new admin but set verified to false
    const newAdmin = new adminModel({
      name,
      email,
      password: hashedPassword,
      verified: false, // Initially not verified
    });

    const savedAdmin = await newAdmin.save();

    // Generate a verification token
    const verificationToken = jwt.sign({ id: savedAdmin._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Send verification email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      html: `
        <h2>Welcome, ${name}!</h2>
        <p>Please click the link below to verify your email:</p>
        <a href="${process.env.FRONTEND_URL}">Verify Email</a>

      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: "Account created. A verification email has been sent to your email address.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verify Email
const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    // Decode and verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the admin by ID
    const admin = await adminModel.findById(decoded.id);

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Check if already verified
    if (admin.verified) {
      return res.status(200).json({ success: true, message: "Email is already verified" });
    }

    // Update the verified status
    admin.verified = true;
    await admin.save(); // Save changes to the database

    res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ success: false, message: "Verification token has expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ success: false, message: "Invalid token" });
    }
    
    console.error("Error verifying email:", error);
    res.status(500).json({ success: false, message: "Server error while verifying email" });
  }
};


// Login admin
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if admin exists
    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.json({ success: false, message: "Admin does not exist" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    // Check if email is verified
    if (!admin.verified) {
      return res.json({
        success: true,
        verified: false,
        message: "Please verify your email before logging in.",
      });
    }

    // Generate token
    const token = createToken(admin._id);

    // Respond with token and verification status
    res.json({ success: true, token, verified: true });
  } catch (error) {
    console.error("Error logging in:", error);
    res.json({ success: false, message: "An error occurred while logging in" });
  }
};

// Change Password
const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword, confirmPassword } = req.body;

  try {
    // Validate input
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "New password and confirm password do not match" });
    }
    if (!validatePassword(newPassword)) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long and contain at least one number" });
    }

    // Find admin by email
    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.status(400).json({ success: false, message: "Admin does not exist" });
    }

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Old password is incorrect" });
    }

    // Hash new password and update
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    admin.password = hashedNewPassword;
    await admin.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error changing password" });
  }
}

// Send Email to Customer to Resubmit Details
const notifyCustomerToResubmit = async (req, res) => {
  const { verifiedEmail, _id } = req.body; // Change email to verifiedEmail

  try {
    if (!verifiedEmail || !_id) {
      return res.status(400).json({ success: false, message: "Missing customer verifiedEmail or _id" });
    }

    // Validate verifiedEmail
    if (!validator.isEmail(verifiedEmail)) {
      return res.status(400).json({ success: false, message: "Invalid customer verifiedEmail" });
    }

    // Set up nodemailer transport
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Compose the email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: verifiedEmail, // Use verifiedEmail here
      subject: "Details Validation Failed",
      html: `
        <h2>Dear Customer,</h2>
        <p>Unfortunately, your details could not be validated. Please kindly resubmit your information for verification.</p>
        <p>Your customer ID: ${_id}</p>
        <p>If you have any questions, feel free to contact us.</p>
        <br />
        <p>Best regards,</p>
        <p>The Admin Team</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: `Email has been sent to ${verifiedEmail} successfully.`, // Update the success message
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error sending email",
    });
  }
};


        export { loginAdmin, registerAdmin, changePassword, verifyEmail, authenticate, sendResetPasswordEmail, loginLimiter, notifyCustomerToResubmit };

