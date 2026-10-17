import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    required: [true, "firstName is required!"],
  },
  lastName: {
    type: String,
    trim: true,
    required: [true, "lastName is required!"],
  },
  email: {
    type: String,
    trim: true,
    required: [true, "email is required!"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "password is required!"],
  },
});

export const userModel = mongoose.model("user", userSchema);

export default userModel;
