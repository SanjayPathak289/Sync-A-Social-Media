import User from "../model/userModel.js";
import Post from "../model/postModel.js";
import { v2 as cloudinary } from 'cloudinary';
import formidable from "formidable";
import parseForm from '../utils/helpers/parseForm.js';
const createPost = async (req, res) => {

    try {
        // const { fields, files } = await parseForm(req);
        // const postedBy = fields.postedBy[0];
        // const text = fields.text[0];
        // let img = fields.img[0];
        // let file = files.file ? files.file[0] : null;
        const { postedBy, text } = req.body;
        let { img, videoFile } = req.body;
        if (!postedBy || !text) {
            return res.status(400).json({ error: "Please fill all the fields!" })
        }
        const user = await User.findById(postedBy);
        if (!user) {
            return res.staus(404).json({ error: "User not found!" });
        }
        if (user._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "Unauthorized to create post" });
        }
        const maxLength = 500;
        if (text.length > maxLength) {
            return res.status(400).json({ error: `Text must be less than ${maxLength}` });
        }
        if (videoFile) {
            const uploadedResponse = await cloudinary.uploader.upload(videoFile, {
                resource_type: 'video'
            });
            videoFile = uploadedResponse.secure_url;
            img = "";
        }
        if (!videoFile && img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
            videoFile = "";
        }
        const newPost = new Post({
            postedBy, text, img, videoFile
        });
        await newPost.save();
        return res.status(200).json(newPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(404).json({ error: "Post not found!" });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post not found!" });
        }
        if (post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "Unauthorized to delete the post!" });
        }
        if (post.img) {
            await cloudinary.uploader.destroy(post.img.split("/").pop().split(".")[0]);
        }
        await Post.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: "Post deleted successfully!" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const likeUnlikePost = async (req, res) => {
    try {
        const { id: postId } = req.params;
        const userId = req.user._id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found!" });
        }
        const userLikedPost = post.likes.includes(userId);
        if (userLikedPost) {
            await Post.updateOne({ _id: postId }, {
                $pull: { likes: userId }
            });
            return res.status(200).json({ message: "Post unliked!" });
        }
        else {
            post.likes.push(userId);
            await post.save();
            return res.status(200).json({ message: "Post liked!" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const replyToPost = async (req, res) => {
    try {
        const { text } = req.body;
        const { id: postId } = req.params;
        const userId = req.user._id;
        const userProfilePic = req.user.profilePic;
        const username = req.user.username;
        if (!text) {
            return res.status(400).json({ error: "Text field is required!" });
        }
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found!" });
        }
        const reply = { userId, text, userProfilePic, username };
        post.replies.push(reply);
        await post.save();

        return res.status(200).json(reply);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getFeedPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found!" });
        }
        const following = user.following;
        const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({ createdAt: -1 });
        return res.status(200).json(feedPosts);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}
const getUserPosts = async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            res.status(404).json({ error: "User not found!" });
        }
        const posts = await Post.find({ postedBy: user._id }).sort({ createdAt: -1 });
        return res.status(200).json(posts);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export { createPost, getPost, deletePost, likeUnlikePost, replyToPost, getFeedPosts, getUserPosts };