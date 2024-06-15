import express from 'express';
import auth from '../middlewares/auth.js';
import { createPost, deletePost, getFeedPosts, getPost, getUserPosts, likeUnlikePost, replyToPost } from '../controllers/postController.js';
const router = express.Router();

router.get("/feed", auth, getFeedPosts);
router.get("/:id", getPost);
router.get("/user/:username", getUserPosts);
router.post("/create", auth, createPost);
router.delete("/:id", auth, deletePost);
router.put("/like/:id", auth, likeUnlikePost);
router.put("/reply/:id", auth, replyToPost);

export default router;