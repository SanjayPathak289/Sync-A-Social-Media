import { Avatar, Box, Button, Flex, FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Skeleton, SkeletonCircle, SkeletonText, Spinner, Text, useDisclosure } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';
import useShowToast from '../hooks/useShowToast';
import postsAtom from '../atoms/postsAtom';
import conversationsAtom from '../atoms/conversationsAtom';
import { IoSendSharp } from "react-icons/io5"

const Actions = ({ post }) => {
    const user = useRecoilValue(userAtom);
    const [posts, setPosts] = useRecoilState(postsAtom);
    const [liked, setLiked] = useState(post.likes.includes(user?._id));
    const showToast = useShowToast();
    const [isLiking, setIsLiking] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [reply, setReply] = useState("");
    const handleLikeUnlike = async () => {
        if (!user) return showToast("Error", "Login first", "error");
        if (isLiking) return;
        setIsLiking(true);
        try {
            const res = await fetch(`/api/posts/like/${post._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const data = await res.json();
            if (data.error) {
                return showToast("Error", error.message, "error")
            }
            if (!liked) {
                const updatedPost = posts.map((p) => {
                    if (p._id === post._id) {
                        return { ...p, likes: [...p.likes, user._id] };
                    }
                    return p;
                })
                setPosts(updatedPost);
            }
            else {
                const updatedPost = posts.map((p) => {
                    if (p._id === post._id) {
                        return { ...p, likes: p.likes.filter((id) => id !== user._id) };
                    }
                    return p;
                })
                setPosts(updatedPost);
            }
            setLiked(!liked);
        } catch (error) {
            showToast("Error", error.message, "error")
        }
        finally {
            setIsLiking(false);
        }
    };

    const handleReply = async () => {
        if (!user) return showToast("Error", "Login first", "error");
        if (isReplying) return;
        setIsReplying(true);
        try {
            const res = await fetch(`/api/posts/reply/${post._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ text: reply })
            })
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error")
                return;
            }
            const updatedPost = posts.map((p) => {
                if (p._id === post._id) {
                    return { ...p, replies: [...p.replies, data] };
                }
                return p;
            })
            setPosts(updatedPost);
            showToast("Replied!", "", "success");
            setReply("");
            onClose();
        } catch (error) {
            showToast("Error", error.message, "error")
        }
        finally {
            setIsReplying(false);
        }
    }
    return (
        <Flex flexDirection={"column"}>
            <Flex gap={3} my={2} onClick={(e) => e.preventDefault()}>
                <svg
                    aria-label='Like'
                    color={liked ? "rgb(237, 73, 86)" : ""}
                    fill={liked ? "rgb(237, 73, 86)" : "transparent"}
                    height='19'
                    role='img'
                    viewBox='0 0 24 22'
                    width='20'
                    onClick={handleLikeUnlike}
                >
                    <path
                        d='M1 7.66c0 4.575 3.899 9.086 9.987 12.934.338.203.74.406 1.013.406.283 0 .686-.203 1.013-.406C19.1 16.746 23 12.234 23 7.66 23 3.736 20.245 1 16.672 1 14.603 1 12.98 1.94 12 3.352 11.042 1.952 9.408 1 7.328 1 3.766 1 1 3.736 1 7.66Z'
                        stroke='currentColor'
                        strokeWidth='2'
                    ></path>
                </svg>
                <svg
                    aria-label='Comment'
                    color=''
                    fill=''
                    height='20'
                    role='img'
                    viewBox='0 0 24 24'
                    width='20'
                    cursor={"pointer"}
                    onClick={() => {
                        if (user) {
                            onOpen();
                        }
                        else {
                            showToast("Error", "Please login!", "error");
                        }
                    }}
                >
                    <title>Comment</title>
                    <path
                        d='M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z'
                        fill='none'
                        stroke='currentColor'
                        strokeLinejoin='round'
                        strokeWidth='2'
                    ></path>
                </svg>

                <ShareSVG post={post} />
            </Flex>
            <Flex gap={2} alignItems={"center"}>
                <Text color={"gray.light"} fontSize={"sm"}>{post.likes.length} likes</Text>
                <Box width={0.5} height={0.5} borderRadius={"full"} bg={"gray.light"}></Box>
                <Text color={"gray.light"} fontSize={"sm"}>{post.replies.length} replies</Text>
            </Flex>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader></ModalHeader>
                    <ModalBody pb={6}>
                        <FormControl>
                            <Input placeholder='Reply' value={reply} onChange={(e) => setReply(e.target.value)} />
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' size={"sm"} mr={3} onClick={handleReply} isLoading={isReplying}>
                            Reply
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Flex>
    )
}

export default Actions


const ShareSVG = ({ post }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [conversations, setConversations] = useRecoilState(conversationsAtom);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const showToast = useShowToast();
    const [selectedUser, setSelectedUser] = useState(null);
    const user = useRecoilValue(userAtom);

    const getConversations = async () => {
        if (!user) {
            return showToast("Error", "Please login!", "error")
        };
        try {
            const res = await fetch("/api/messages/conversations");
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                setConversations([]);
                return;
            }
            setConversations(data);
        } catch (error) {
            setConversations([]);
            showToast("Error", error.message, "error");
        } finally {
            setLoadingConversations(false);
        }
    }
    const handleShare = async (e) => {
        e.preventDefault();
        if (isSending) return;
        if (!user) return showToast("Error", "Login first", "error");
        setIsSending(true);

        try {
            let userOfPost;
            const resUser = await fetch(`/api/users/profile/${post.postedBy}`);
            const dataUser = await resUser.json();
            if (dataUser.error) {
                showToast("Error", dataUser.error, "error");
            }
            userOfPost = dataUser.username;
            const { protocol, host } = window.location;
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: `${protocol}//${host}/${userOfPost}/post/${post._id}`,
                    img: "",
                    recipientId: selectedUser.participants[0]._id
                })
            })
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
            }
            onClose();
        } catch (error) {
            showToast("Error", error.message, "error");
        }
        finally {
            setIsSending(false);
        }
    }
    return (
        <>
            <svg
                aria-label='Share'
                color=''
                fill='rgb(243, 245, 247)'
                height='20'
                role='img'
                viewBox='0 0 24 24'
                width='20'
                cursor={"pointer"}
                onClick={() => {
                    getConversations();
                    user && onOpen();
                }}
            >
                <title>Share</title>
                <line
                    fill='none'
                    stroke='currentColor'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    x1='22'
                    x2='9.218'
                    y1='3'
                    y2='10.083'
                ></line>
                <polygon
                    fill='none'
                    points='11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334'
                    stroke='currentColor'
                    strokeLinejoin='round'
                    strokeWidth='2'
                ></polygon>
            </svg>
            <Modal isOpen={isOpen} onClose={() => {
                onClose();
                setSelectedUser(null);
            }}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Send</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex w={"full"} flexWrap={"wrap"} gap={7}>

                            {loadingConversations && [0, 1, 2, 3, 4].map((_, i) => (
                                <Flex key={i} flexDirection={"column"} alignItems={"center"}>
                                    <SkeletonCircle size={"16"} mb={2} />
                                    <Skeleton w={"full"} h={5} />
                                </Flex>
                            ))}

                            {!loadingConversations && conversations && conversations.map((conv) => (
                                <Flex key={conv._id} flexDirection={"column"} alignItems={"center"} cursor={"pointer"} onClick={() => setSelectedUser(conv)}>
                                    <Avatar src={conv.participants[0].profilePic} size={"lg"} border={selectedUser?._id === conv._id ? "3px solid black" : ""} />
                                    <Text>{conv.participants[0].username}</Text>
                                </Flex>
                            ))}
                        </Flex>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={() => {
                            onClose();
                            setSelectedUser(null);
                        }}>
                            Close
                        </Button>
                        {selectedUser && (
                            isSending ? <Spinner size={"md"} ml={"50px"} /> : (
                                <IoSendSharp size={24} cursor={"pointer"} style={{ marginLeft: "50px" }} onClick={handleShare} />
                            )
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}