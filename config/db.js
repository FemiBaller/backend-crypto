import mongoose from "mongoose";
export const connectDB = async () => {
  await mongoose
    .connect(
      "mongodb+srv://olayemifemi039:Dayo2001@cluster0.y9qmx.mongodb.net/WALLET-RECT-1"
    )
    .then(() => console.log("db connected"));
};
//mongodb+srv://femoola039:<password>@cluster0.0aoel6l.mongodb.net/?