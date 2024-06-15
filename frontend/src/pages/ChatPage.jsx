import { SearchIcon } from '@chakra-ui/icons'
import { Box, Button, Flex, Input, Skeleton, SkeletonCircle, Text, useColorModeValue } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import Conversation from '../components/Conversation'
import { IoChatboxEllipsesOutline } from 'react-icons/io5';
import useShowToast from '../hooks/useShowToast';
import MessageContainer from '../components/MessageContainer';
import { useRecoilState, useRecoilValue } from 'recoil';
import conversationsAtom, { selectedConversationAtom } from '../atoms/conversationsAtom';
import userAtom from '../atoms/userAtom';
import { useSocket } from '../context/SocketContext';

const ChatPage = () => {
    const showToast = useShowToast();
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [conversations, setConversations] = useRecoilState(conversationsAtom);
    const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);
    const currentUser = useRecoilValue(userAtom);
    const { socket, onlineUsers } = useSocket()
    useEffect(() => {
        const getConversations = async () => {
            try {
                const res = await fetch("/api/messages/conversations");
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                setConversations(data);
            } catch (error) {
                showToast("Error", error.message, "error");
            } finally {
                setLoadingConversations(false);
            }
        }
        getConversations();
    }, [showToast, setConversations])

    useEffect(() => {
        socket?.on("messagesSeen", ({ conversationId }) => {
            setConversations((prevConv) => {
                const updatedConv = prevConv.map((conv) => {
                    if (conv._id === conversationId) {
                        return {
                            ...conv,
                            lastMessage: {
                                ...conv.lastMessage,
                                seen: true
                            }
                        }
                    }
                    return conv;
                });
                return updatedConv;
            })
        })
    }, [socket, setConversations])
    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/users/profile/${searchText}`);
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            if (data._id === currentUser._id) {
                showToast("Error", "You cannot message yourself", "error");
                return;
            }
            const conversationAlreadyExists = conversations.find(conversation => conversation.participants[0]._id === data._id);
            if (conversationAlreadyExists) {
                setSelectedConversation({
                    _id: conversationAlreadyExists._id,
                    userId: data._id,
                    username: data.username,
                    userProfilePic: data.profilePic
                });
                return;
            }
            const mockConversation = {
                mock: true,
                lastMessage: {
                    text: "",
                    sender: ""
                },
                _id: Date.now(),
                participants: [{
                    _id: data._id,
                    username: data.username,
                    profilePic: data.profilePic
                }]
            }
            setConversations((prevConv) => [...prevConv, mockConversation]);

        } catch (error) {
            showToast("Error", error.message, "error");
        }
        finally {
            setLoading(false);
        }
    }
    return (
        <Box position={"absolute"} left={"50%"} transform={"translateX(-50%)"} w={{
            "base": "100%",
            "md": "80%",
            'lg': "750px"
        }} p={4}>

            <Flex
                gap={4}
                flexDirection={{
                    "base": "column",
                    "md": "row",
                }}
                maxW={{
                    'sm': "400px",
                    'md': "full"
                }}
                mx={"auto"}>
                <Flex flex={30} gap={2} flexDirection={"column"}
                    maxWidth={{
                        'sm': "250px",
                        'md': "full"
                    }}
                    mx={"auto"}>
                    <Text fontWeight={700} color={useColorModeValue("gray.600", "gray.400")}>
                        Your Conversations
                    </Text>
                    <form onSubmit={handleSearch}>
                        <Flex alignItems={"center"} gap={2}>
                            <Input type='text' placeholder='Search user' value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                            <Button size={"md"} onClick={handleSearch} isLoading={loading}><SearchIcon /></Button>
                        </Flex>
                    </form>
                    {loadingConversations && (
                        [0, 1, 2, 3, 4].map((_, i) => (
                            <Flex key={i} gap={4} alignItems={"center"} p={1} borderRadius={"md"}>
                                <Box><SkeletonCircle size={10} /></Box>
                                <Flex w={"full"} flexDirection={"column"} gap={3}>
                                    <Skeleton h={"10px"} w={"80px"} />
                                    <Skeleton h={"8px"} w={"90%"} />
                                </Flex>
                            </Flex>

                        ))
                    )}
                    {!loadingConversations && (
                        conversations.map((conversation) => (
                            <Conversation isOnline={onlineUsers.includes(conversation.participants[0]._id)} key={conversation._id} conversation={conversation} />
                        ))
                    )}
                </Flex>
                {!selectedConversation._id && (<Flex flex={70} borderRadius={"md"} p={2} flexDirection={"column"} alignItems={"center"} justifyContent={"center"} height={"400px"}>
                    <IoChatboxEllipsesOutline size={50} />
                    <Text fontSize={20}>Select a conversation to start messaging</Text>
                </Flex>)}

                {selectedConversation._id && <MessageContainer />}
            </Flex>
        </Box>
    )
}

export default ChatPage