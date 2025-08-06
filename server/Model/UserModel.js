import mongoose from "mongoose"; 

const userSchema = new mongoose.Schema({ //creating a schema
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  confirmPassword: { type: String, required: true },
});

export const UserModel = await mongoose.model("User", userSchema);
