import jwt from 'jsonwebtoken';
import User from '../model/userModel.js';
const auth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");
        req.user = user;
        next();

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export default auth;
