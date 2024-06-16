import { useState } from "react"
import useShowToast from "./useShowToast";

const usePreviewImage = () => {
    const [imgUrl, setImgUrl] = useState(null);
    const showToast = useShowToast();
    const [videoFile, setVideoFile] = useState(null);
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImgUrl(reader.result);
            }
            reader.readAsDataURL(file);
        }
        else if (file && file.type.startsWith("video/")) {
            setImgUrl(URL.createObjectURL(file));
            const reader = new FileReader();
            reader.onloadend = () => {
                setVideoFile(reader.result);
            }
            reader.readAsDataURL(file);
        }
        else {
            showToast("Invalid file type", "Please select an image file", "error");
            setImgUrl(null);
        }
    }
    return { handleImageChange, imgUrl, setImgUrl, videoFile, setVideoFile };
}

export default usePreviewImage