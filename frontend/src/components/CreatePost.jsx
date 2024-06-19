import { AddIcon } from '@chakra-ui/icons'
import { AspectRatio, Box, Button, CloseButton, Flex, FormControl, Image, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, Textarea, useColorModeValue, useDisclosure } from '@chakra-ui/react'
import React, { useRef, useState } from 'react'
import usePreviewImage from '../hooks/usePreviewImage'
import { BsFillImageFill } from 'react-icons/bs'
import { useRecoilState, useRecoilValue } from 'recoil'
import userAtom from '../atoms/userAtom'
import useShowToast from '../hooks/useShowToast'
import postsAtom from '../atoms/postsAtom'
import { useParams } from 'react-router-dom'

const CreatePost = ({ isTop }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [postText, setPostText] = useState("");
    const user = useRecoilValue(userAtom);
    const { handleImageChange, imgUrl, setImgUrl, videoFile, setVideoFile } = usePreviewImage();
    const imageRef = useRef(null);
    const MAX_CHAR = 500;
    const [remainingChar, setRemainingChar] = useState(MAX_CHAR);
    const showToast = useShowToast();
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useRecoilState(postsAtom);
    const { username } = useParams();
    const handleTextChange = (e) => {
        const inputText = e.target.value;
        if (inputText.length > MAX_CHAR) {
            const truncatedText = inputText.slice(0, MAX_CHAR);
            setPostText(truncatedText);
            setRemainingChar(0);
        }
        else {
            setPostText(inputText);
            setRemainingChar(MAX_CHAR - inputText.length);
        }

    }
    const handleCreatePost = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/posts/create", {
                method: "POST",
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify({
                    postedBy: user._id,
                    text: postText,
                    img: imgUrl,
                    videoFile: videoFile
                })
            });
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            showToast("Success", "Post created!", "success");
            setPostText("");
            setImgUrl("");
            setVideoFile("");
            onClose();
            if (username === user.username) {
                setPosts([data, ...posts]);
            }

        } catch (error) {
            showToast("Error", error, "error");
        }
        finally {
            setLoading(false);
        }

    }
    return (
        <>
            {isTop ? (
                <Button
                    w={{
                        "base": "90%",
                        "md": "60%"
                    }}
                    leftIcon={<AddIcon />}
                    bg={useColorModeValue("gray.300", "gray.dark")}
                    onClick={onOpen}
                    mb={4}
                    position={"relative"}
                    left={"5%"}>
                    Post
                </Button>
            ) : (
                <Button
                    position={"fixed"}
                    bottom={10}
                    right={10}
                    leftIcon={<AddIcon />}
                    bg={useColorModeValue("gray.300", "gray.dark")}
                    onClick={onOpen}>
                    Post
                </Button>
            )}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create Post</ModalHeader>
                    <ModalCloseButton onClick={() => {
                        setImgUrl("");
                        setVideoFile("");
                    }} />
                    <ModalBody pb={6}>
                        <FormControl>
                            <Textarea placeholder='Post content goes here'
                                onChange={handleTextChange}
                                value={postText}
                            />
                            <Text fontSize={"xs"}
                                fontWeight={"bold"}
                                textAlign={"right"}
                                m={1}
                                color={useColorModeValue("gray.800", "white")}>{remainingChar}/{MAX_CHAR}</Text>
                            <Input type='file' hidden ref={imageRef} onChange={handleImageChange} />
                            <BsFillImageFill
                                style={{
                                    marginLeft: "5px",
                                    cursor: "pointer",
                                }}
                                size={16}
                                onClick={() => imageRef.current.click()}
                            />
                        </FormControl>
                        {imgUrl && (
                            <Flex mt={5} w={"full"} position={"relative"}>
                                {!videoFile && (
                                    <Image src={imgUrl} alt='Selected image' />
                                )}
                                {videoFile && (
                                    <Box
                                        w={"full"}
                                        borderRadius={6}
                                        border={"1px solid"}
                                        borderColor={"gray.light"}
                                        style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}
                                    >
                                        <video
                                            src={imgUrl}
                                            controlsList="nodownload"
                                            controls
                                            allowFullScreen
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                border: 'none',
                                                outline: "none",
                                            }}
                                        ></video>
                                    </Box>
                                )}


                                <CloseButton
                                    onClick={() => {
                                        setImgUrl("");
                                        setVideoFile("");
                                    }}
                                    bg={useColorModeValue("white", "gray.800")}
                                    position={"absolute"}
                                    top={2}
                                    right={2}
                                />
                            </Flex>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={handleCreatePost} isLoading={loading}>
                            Post
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default CreatePost