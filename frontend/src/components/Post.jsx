import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Avatar, Box, Button, Flex, Image, Menu, MenuButton, MenuItem, MenuList, Portal, Text, useDisclosure, useToast } from "@chakra-ui/react"
import { BsThreeDots } from "react-icons/bs"
import { Link, useNavigate } from "react-router-dom"
import Actions from "./Actions"
import { useEffect, useState } from "react"
import useShowToast from "../hooks/useShowToast"
import { formatDistanceToNow } from "date-fns";
import { DeleteIcon } from "@chakra-ui/icons"
import { useRecoilState, useRecoilValue } from "recoil"
import userAtom from "../atoms/userAtom"
import postsAtom from "../atoms/postsAtom"

const Post = ({ post, postedBy }) => {
    const [user, setUser] = useState(null);
    const currentUser = useRecoilValue(userAtom);
    const [posts, setPost] = useRecoilState(postsAtom);
    const { isOpen, onOpen, onClose } = useDisclosure()
    const showToast = useShowToast();
    const copyURL = (e) => {
        e.preventDefault();
        const currentURL = window.location.href;
        navigator.clipboard.writeText(currentURL).then(() => {
            showToast("Copied!", "", "success");
        })
    }
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        const getUser = async () => {
            try {
                const res = await fetch(`/api/users/profile/${postedBy}`)
                const data = await res.json();
                if (data.error) {
                    showToast("Error", error.message, "error");
                    return;
                }
                setUser(data);
            } catch (error) {
                showToast("Error", error.message, "error");
                setUser(null);
            }
        }
        getUser();

        return () => {

        }
    }, [postedBy]);
    const handleDeletePost = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/posts/${post._id}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            onClose();
            showToast("Success", "Post deleted!", "success");
            setPost(posts.filter(p => p._id !== post._id));
        } catch (error) {
            showToast("Error", error.message, "error");
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <Link to={`/${user?.username}/post/${post?._id}`}>
            <Flex gap={3} mb={4} py={5}>
                <Flex flexDirection={"column"} alignItems={"center"}>
                    <Avatar size={"md"} name={user?.name} src={user?.profilePic} onClick={(e) => {
                        e.preventDefault();
                        navigate(`/${user.username}`)
                    }} />
                    <Box width={"1px"} height={"full"} bg={"gray.light"} my={2}></Box>
                    <Box position={"relative"} width={"full"}>
                        {post.replies.length === 0 && <Text textAlign={"center"}>😐</Text>}
                        {post.replies[0] && (
                            <Avatar
                                size={"xs"}
                                name={post.replies[0].username}
                                src={post.replies[0].userProfilePic}
                                position={"absolute"}
                                top={"0px"}
                                left={"15px"}
                                padding={"2px"}
                            />
                        )}
                        {post.replies[1] && (
                            <Avatar
                                size={"xs"}
                                name={post.replies[1].username}
                                src={post.replies[1].userProfilePic}
                                position={"absolute"}
                                bottom={0}
                                right={"-5px"}
                                padding={"2px"}
                            />
                        )}

                        {post.replies[2] && (
                            <Avatar
                                size={"xs"}
                                name={post.replies[2].username}
                                src={post.replies[2].userProfilePic}
                                position={"absolute"}
                                bottom={0}
                                left={"4px"}
                                padding={"2px"}
                            />
                        )}
                    </Box>
                </Flex>
                <Flex flex={1} flexDirection={"column"} gap={2}>
                    <Flex justifyContent={"space-between"} w={"full"}>
                        <Flex w={"full"} alignItems={"center"}>
                            <Text fontSize={"sm"} fontWeight={"bold"} onClick={(e) => {
                                e.preventDefault();
                                navigate(`/${user.username}`)
                            }}>{user?.username}</Text>
                            <Image src="/verified.png" w={4} h={4} ml={1} />
                        </Flex>
                        <Flex gap={4} alignItems={"center"}>
                            <Text fontSize={"xs"} width={36} textAlign={"right"} color={"gray.light"}>{formatDistanceToNow(new Date(post.createdAt))} ago</Text>
                            {currentUser?._id === user?._id && (
                                <>
                                    <DeleteIcon onClick={(e) => {
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
                                                    <Button colorScheme='red' onClick={handleDeletePost} ml={3}
                                                        isLoading={loading}>
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
                                    <MenuList bg={"gray.dark"}>
                                        <MenuItem bg={"gray.dark"} onClick={(e) => copyURL(e)}>Copy link</MenuItem>
                                    </MenuList>
                                </Portal>
                            </Menu>
                        </Flex>
                    </Flex>
                    <Text fontSize={"sm"}>{post.text}</Text>
                    {post.img && (
                        <Box
                            borderRadius={6}
                            overflow={"hidden"}
                            border={"1px solid"}
                            borderColor={"gray.light"}>
                            <Image src={post.img} w={"full"} />
                        </Box>
                    )}
                    {post.videoFile && (
                        <Box
                            borderRadius={6}
                            border={"1px solid"}
                            borderColor={"gray.light"}
                            style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}
                        >
                            <video
                                src={post.videoFile}
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

                    <Flex gap={3} my={1}>
                        <Actions post={post} />
                    </Flex>

                </Flex>


            </Flex>
        </Link >
    )
}

export default Post;