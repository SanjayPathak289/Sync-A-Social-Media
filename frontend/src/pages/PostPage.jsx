import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Avatar, Box, Button, Divider, Flex, Image, Menu, MenuButton, MenuItem, MenuList, Portal, Spinner, Text, useDisclosure } from "@chakra-ui/react"
import { BsThreeDots } from "react-icons/bs"
import Actions from "../components/Actions"
import { useEffect, useState } from "react"
import Comment from "../components/Comment"
import useGetUserProfile from "../hooks/useGetUserProfile"
import useShowToast from "../hooks/useShowToast"
import { useNavigate, useParams } from "react-router-dom"
import { DeleteIcon } from "@chakra-ui/icons"
import { formatDistanceToNow } from "date-fns";
import { useRecoilState, useRecoilValue } from "recoil"
import userAtom from "../atoms/userAtom"
import postsAtom from "../atoms/postsAtom"


const PostPage = () => {
    const { loading, user } = useGetUserProfile();
    const [posts, setPosts] = useRecoilState(postsAtom);
    const showToast = useShowToast();
    const { pid } = useParams();
    const { isOpen, onOpen, onClose } = useDisclosure()
    const currentUser = useRecoilValue(userAtom);
    const navigate = useNavigate();
    const currentPost = posts[0];
    const copyURL = () => {
        const currentURL = window.location.href;
        navigator.clipboard.writeText(currentURL).then(() => {
            showToast("Copied", "", "success");
        })
    }
    const handleDeletePost = async () => {
        try {
            const res = await fetch(`/api/posts/${currentPost._id}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            onClose();
            showToast("Success", "Post deleted!", "success");
            navigate(`/${user.username}`);

        } catch (error) {
            showToast("Error", error.message, "error");
        }
    }
    useEffect(() => {
        const getPost = async () => {
            // setFetchingPosts(true);
            try {
                const res = await fetch(`/api/posts/${pid}`);
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                setPosts([data]);
            } catch (error) {
                showToast("Error", error, "error");
                setPosts([])
            }
            finally {
                // setFetchingPosts(false);
            }
        }
        getPost();
    }, [showToast, pid, setPosts])

    if (!user && loading) {
        return (
            <Flex justifyContent={"center"} my={12}>
                <Spinner size={"xl"} />
            </Flex>
        )
    }
    if (!currentPost) return null;

    return (
        <>
            <Flex>
                <Flex w={"full"} alignItems={"center"} gap={3}>
                    <Avatar
                        src={user?.profilePic}
                        size={"md"}
                        name={user?.name}
                        cursor={"pointer"}
                        onClick={() => {
                            navigate(`/${user.username}`)
                        }}
                    />
                    <Flex>
                        <Text fontSize={"sm"} fontWeight={"bold"} cursor={"pointer"} onClick={() => {
                            navigate(`/${user.username}`)
                        }}>{user?.username}</Text>
                        <Image src="/verified.png" w={4} h={4} ml={4} />
                    </Flex>
                </Flex>
                <Flex gap={4} alignItems={"center"}>
                    <Text fontSize={"xs"} width={36} textAlign={"right"} color={"gray.light"}>{formatDistanceToNow(new Date(currentPost.createdAt))} ago</Text>
                    {currentUser?._id === user?._id && (
                        <>
                            <DeleteIcon
                                cursor={"pointer"}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onOpen();
                                }} />
                            <AlertDialog
                                isOpen={isOpen}
                                onClose={onClose}
                            >
                                <AlertDialogOverlay>
                                    <AlertDialogContent>
                                        <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                                            Delete Post
                                        </AlertDialogHeader>

                                        <AlertDialogBody>
                                            Are you sure? You can't undo this action afterwards.
                                        </AlertDialogBody>

                                        <AlertDialogFooter>
                                            <Button onClick={onClose}>
                                                Cancel
                                            </Button>
                                            <Button colorScheme='red' onClick={handleDeletePost} ml={3}>
                                                Delete
                                            </Button>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialogOverlay>
                            </AlertDialog>
                        </>
                    )}
                    <Menu>
                        <MenuButton>
                            <BsThreeDots cursor={"pointer"} />
                        </MenuButton>
                        <Portal>
                            <MenuList bg={"gray.dark"} color={"white"}>
                                <MenuItem bg={"gray.dark"} onClick={(e) => copyURL(e)}>Copy link</MenuItem>
                            </MenuList>
                        </Portal>
                    </Menu>
                </Flex>
            </Flex>
            <Text my={3}>{currentPost.text}</Text>
            {currentPost.img && (
                <Box
                    borderRadius={6}
                    overflow={"hidden"}
                    border={"1px solid"}
                    borderColor={"gray.light"}>
                    <Image src={currentPost.img} w={"full"} />
                </Box>
            )}
            {currentPost.videoFile && (
                <Box
                    borderRadius={6}
                    border={"1px solid"}
                    borderColor={"gray.light"}
                    style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}
                >
                    <video
                        src={currentPost.videoFile}
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
                            outline: "none"
                        }}
                    ></video>
                </Box>
            )}
            <Flex gap={3} my={3}>
                <Actions post={currentPost} />
            </Flex>
            <Divider my={4} borderColor={"gray.700"} />
            {currentPost.replies.map(reply => (
                <Comment
                    key={reply._id}
                    reply={reply}
                    lastReply={reply._id === currentPost.replies[currentPost.replies.length - 1]._id}
                />
            ))}
        </>
    )
}

export default PostPage