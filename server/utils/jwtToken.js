import jwt from 'jsonwebtoken'

// Create token and save in cookie or just return it
const sendToken = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            username: user.username,
            phone: user.phone,
            role: user.role
        }
    });
}

export default sendToken;