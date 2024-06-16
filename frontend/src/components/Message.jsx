import { Avatar, Box, Flex, Image, Skeleton, Text } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useRecoilValue } from 'recoil'
import userAtom from '../atoms/userAtom'
import { selectedConversationAtom } from '../atoms/conversationsAtom'
import { BsCheck2All } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import { MdContentCopy } from "react-icons/md";
import useShowToast from '../hooks/useShowToast'

const Message = ({ message, ownMessage }) => {
    const currentUser = useRecoilValue(userAtom);
    const selectedConversation = useRecoilValue(selectedConversationAtom);
    const [imgLoaded, setImgLoaded] = useState(false);
    const showToast = useShowToast();
    const isURL = (text) => {
        try {
            new URL(text);
            return true;
        } catch (error) {
            return false;
        }
    }
    const copyMessage = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            showToast("Copied", "", "success");
        })
    }
    return (
        <>
            {ownMessage ? (
                <Flex gap={2} alignSelf={"flex-end"} my={2}>
                    {message.text && (
                        <Flex bg={"green.800"} maxW={"350px"} p={1} borderRadius={"md"} wordBreak={"break-word"} color={"white"}>
                            {isURL(message.text) && (
                                <Link to={message.text}>
                                    <Text color={"white"}>{message.text}</Text>
                                </Link>
                            )}
                            {!isURL(message.text) && (
                                <Text color={"white"}>
                                    {message.text}
                                </Text>

                            )}
                            <Box flexDirection={"column"} justifyContent={"space-between"} display={"flex"} ml={1} color={message.seen ? "blue.400" : ""} fontWeight={"bold"}>
                                {isURL(message.text) && (
                                    <MdContentCopy cursor={"pointer"} size={16} onClick={() => copyMessage(message.text)} />
                                )}
                                <BsCheck2All size={16} />
                            </Box>
                        </Flex>
                    )}
                    {message.img && !imgLoaded && (
                        <Flex mt={5} w={"200px"}>
                            <Image src={message.img} hidden onLoad={() => setImgLoaded(true)} alt='Message img' borderRadius={4} />
                            <Skeleton w={"200px"} h={"200px"} borderRadius={4} />
                        </Flex>
                    )}
                    {message.img && imgLoaded && (
                        <Flex mt={5} w={"200px"}>
                            <Image src={message.img} alt='Message img' borderRadius={4} />
                            <Box alignSelf={"flex-end"} ml={1} color={message.seen ? "blue.400" : ""} fontWeight={"bold"}>
                                <BsCheck2All size={16} />
                            </Box>
                        </Flex>
                    )}

                    <Avatar src={currentUser.profilePic} w={7} h={7} />
                </Flex>
            ) :
                (
                    <Flex gap={2} my={2}>
                        <Avatar src={selectedConversation.userProfilePic} w={7} h={7} />
                        {message.text && isURL(message.text) && (
                            <>
                                <Link to={message.text}>
                                    <Text maxW={"350px"} bg={"gray.400"} p={1} borderRadius={"md"} color={"black"} wordBreak={"break-word"}>{message.text}</Text>
                                </Link>
                                <MdContentCopy cursor={"pointer"} size={16} onClick={() => copyMessage(message.text)} />
                            </>
                        )}
                        {message.text && !isURL(message.text) && (
                            <Text maxW={"350px"} bg={"gray.400"} p={1} borderRadius={"md"} color={"black"} wordBreak={"break-word"}>
                                {message.text}
                            </Text>

                        )}
                        {message.img && !imgLoaded && (
                            <Flex mt={5} w={"200px"}>
                                <Image src={message.img} hidden onLoad={() => setImgLoaded(true)} alt='Message img' borderRadius={4} />
                                <Skeleton w={"200px"} h={"200px"} borderRadius={4} />
                            </Flex>
                        )}
                        {message.img && imgLoaded && (
                            <Flex mt={5} w={"200px"}>
                                <Image src={message.img} alt='Message img' borderRadius={4} />
                            </Flex>
                        )}

                    </Flex>
                )}
        </>
    )
}

export default Message