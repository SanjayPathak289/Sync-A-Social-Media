import express from 'express';
import { disableUser, followUnfollowUser, getFollowersFollowing, getSuggestedUsers, getUserProfile, loginUser, logoutUser, signupUser, updateUser } from '../controllers/userController.js';
import auth from '../middlewares/auth.js';
const router = express.Router();

router.get("/profile/:query", getUserProfile)
router.get("/suggested", auth, getSuggestedUsers);
router.get("/:username/followQuery", getFollowersFollowing);
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/follow/:id", auth, followUnfollowUser);
router.put("/update/:id", auth, updateUser);
router.put("/disable", auth, disableUser);


export default router;