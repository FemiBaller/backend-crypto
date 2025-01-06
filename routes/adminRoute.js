import express from "express"
import { loginAdmin,registerAdmin,changePassword } from "../controllers/adminController.js"
const adminRouter = express.Router();
adminRouter.post("/register", registerAdmin);
adminRouter.post("/login", loginAdmin);
adminRouter.post("/change-password", changePassword); // New route for changing password

export default adminRouter 





// // routes/adminRoute.js
// import express from "express";
// import { loginAdmin, registerAdmin, changePassword } from "../controllers/adminController.js";
// const adminRouter = express.Router();

// adminRouter.post("/register", registerAdmin);
// adminRouter.post("/login", loginAdmin);
// adminRouter.post("/change-password", changePassword); // New route for changing password

// export default adminRouter;
