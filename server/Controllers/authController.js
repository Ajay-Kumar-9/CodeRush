import { UserModel } from "../Model/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Signup
export const Signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
     console.log(req.body);
     
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(404).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const userExists = await UserModel.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Email already in use" });

    // Validate password confirmation

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashpassword = await bcrypt.hash(password, 10);
    const confirmHashPass = await bcrypt.hash(confirmPassword, 10);

    const NewUser = await new UserModel({
      firstName,
      lastName,
      email,
      password: hashpassword,
      confirmPassword: confirmHashPass,
    });

    await NewUser.save();

    const jwtToken = jwt.sign(
      { userId: NewUser._id, email: NewUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "12hr" }
    );

    res
      .status(201)
      .json({ message: "Signup successful", success: true, token: jwtToken });
  } catch (error) {
    console.error("Internal Server Error");
    res.status(500).json({ message: error.message });
  }
};

// Login
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(404).json({ message: "All Fields are required" });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Invalid Email or Password", success: false });
    }

    //compare pass

    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
      return res
        .status(404)
        .json({ message: "Invalid Email or Password", success: false });
    }

    //create a jwt

    const jwtToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "12hr" }
    );

    res
      .status(200)
      .json({ message: "Login Successfull", success: true, token: jwtToken });
  } catch (error) {
    console.error("Internal Server Error", error.message);
    res.status(500).json({ message: error.message });
  }
};
