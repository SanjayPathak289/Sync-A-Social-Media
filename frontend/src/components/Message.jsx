import { Avatar, Box, Flex, Image, Skeleton, Text } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useRecoilValue } from 'recoil'
import userAtom from '../atoms/userAtom'
import { selectedConversationAtom } from '../atoms/conversationsAtom'
import { BsCheck2All } from 'react-icons/bs'

const Message = ({ message, ownMessage }) => {
    const currentUser = useRecoilValue(userAtom);
    const selectedConversation = useRecoilValue(selectedConversationAtom);
    const [imgLoaded, setImgLoaded] = useState(false);
    return (
        <>
            {ownMessage ? (
                <Flex gap={2} alignSelf={"flex-end"} my={2}>
                    {message.text && (<Flex bg={"green.800"} maxW={"350px"} p={1} borderRadius={"md"}>
                        <Text color={"white"}>
                            {message.text}
                        </Text>
                        <Box alignSelf={"flex-end"} ml={1} color={message.seen ? "blue.400" : ""} fontWeight={"bold"}>
                            <BsCheck2All size={16} />
                        </Box>
                    </Flex>)}
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
                        {message.text && (
                            <Text maxW={"350px"} bg={"gray.400"} p={1} borderRadius={"md"} color={"black"}>
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