import { Avatar, Divider, Flex, Image, Skeleton, SkeletonCircle, Text, useColorModeValue } from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'
import Message from './Message'
import MessageInput from './MessageInput'
import useShowToast from '../hooks/useShowToast'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import conversationsAtom, { selectedConversationAtom } from '../atoms/conversationsAtom'
import userAtom from '../atoms/userAtom'
import { useSocket } from '../context/SocketContext'
import messageSound from "../assets/sounds/message.mp3";

const MessageContainer = () => {
    const showToast = useShowToast();
    const selectedConversation = useRecoilValue(selectedConversationAtom);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [messages, setMessages] = useState([]);
    const currentUser = useRecoilValue(userAtom);
    const { socket } = useSocket();
    const messageRef = useRef(null);
    const setConversations = useSetRecoilState(conversationsAtom);

    useEffect(() => {
        socket.on("newMessage", (message) => {
            if (selectedConversation._id === message.conversationId) {
                setMessages((prevMessage) => [...prevMessage, message])
            }
            if (!document.hasFocus()) {
                const sound = new Audio(messageSound);
                sound.play();
            }
            setConversations((prevConv) => {
                const updatedConv = prevConv.map((conv) => {
                    if (conv._id === message.conversationId) {
                        return {
                            ...conv,
                            lastMessage: {
                                text: message.text,
                                sender: message.sender
                            }
                        }
                    }
                    return conv;
                })
                return updatedConv;
            })
        })
        return () => socket.off("newMessage");
    }, [socket, selectedConversation, setConversations])

    useEffect(() => {
        const lastMessageIsFromOtherUser = messages.length && messages[messages.length - 1].sender !== currentUser._id;
        if (lastMessageIsFromOtherUser) {
            socket.emit("markMessagesAsSeen", {
                conversationId: selectedConversation._id,
                userId: selectedConversation.userId
            })
        }
        socket.on("messagesSeen", ({ conversationId }) => {
            if (selectedConversation._id === conversationId) {
                setMessages((prev) => {
                    const updatedMessages = prev.map((message) => {
                        if (!message.seen) {
                            return {
                                ...message,
                                seen: true
                            }
                        }
                        return message;

                    })
                    return updatedMessages;
                })
            }
        })
    }, [socket, currentUser._id, messages, selectedConversation]);

    useEffect(() => {

        const getMessages = async () => {
            try {
                if (selectedConversation.mock) {
                    setMessages([]);
                    return;
                };
                const res = await fetch(`/api/messages/${selectedConversation.userId}`)
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                }
                setMessages(data);
            } catch (error) {
                showToast("Error", error.message, "error");
            }
            finally {
                setLoadingMessages(false);
            }
        }
        getMessages();
    }, [showToast, selectedConversation.userId, selectedConversation.mock])

    useEffect(() => {
        messageRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages])


    return (
        <Flex flex={70} bg={useColorModeValue("gray.200", "gray.dark")} borderRadius={"md"} flexDirection={"column"} p={2} maxH={"700px"} justifyContent={"space-between"}>
            <Flex w={"full"} h={12} alignItems={"center"} gap={2}>
                <Avatar src={selectedConversation.userProfilePic} size={"sm"} />
                <Text display={"flex"} alignItems={"center"}>{selectedConversation.username} <Image src='/verified.png' w={4} h={4} ml={1} /></Text>
            </Flex>
            <Divider />
            <Flex flexDirection={"column"} gap={4} my={4} maxH={"600px"} overflowY={"auto"} p={2}>
                {loadingMessages && (
                    [0, 1, 2, 3, 4, 5, 6, 7].map((_, i) => (
                        <Flex key={i} gap={2} alignItems={"center"}
                            p={1} borderRadius={"md"}
                            alignSelf={i % 2 === 0 ? "flex-start" : "flex-end"}>
                            {i % 2 === 0 && (
                                <SkeletonCircle size={7} />
                            )}
                            <Flex flexDirection={"column"} gap={2}>
                                <Skeleton h={"24px"} w={"250px"} />
                            </Flex>
                            {i % 2 !== 0 && (
                                <SkeletonCircle size={7} />
                            )}
                        </Flex>

                    ))
                )}
                {!loadingMessages && (
                    messages.map((message) => (
                        <Flex key={message._id} direction={"column"} ref={messages.length - 1 === messages.indexOf(message) ? messageRef : null}>
                            <Message message={message} ownMessage={currentUser._id === message.sender} />
                        </Flex>
                    ))
                )}
            </Flex>

            <MessageInput setMessages={setMessages} />
        </Flex>
    )
}

export default MessageContainer