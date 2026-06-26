const User=require("../models/user.js");
const bcrypt=require("bcrypt");
const {StatusCodes}=require("http-status-codes");
const crypto=require("crypto");
const jwt=require("jsonwebtoken");

module.exports.register = async (req, res) => {
    const { name, username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(StatusCodes.CONFLICT).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            username,
            password: hashedPassword,
        });

        await newUser.save();

        return res.status(StatusCodes.CREATED).json({
            message: "User registered successfully"
        });

    } catch (e) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
};

module.exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Please enter the correct details"
        });
    }

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
                        {
                          userId: user._id,
                          username: user.username
                        },
                          process.env.JWT_SECRET,
                        {
                          expiresIn: "7d"
                        }
                    );

        

        return res.status(StatusCodes.OK).json({
            message: "Login successful",
            token
        });

    } catch (e) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR)
                  .json({ message: e.message });
    }
};
