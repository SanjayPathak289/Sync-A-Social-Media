import { Avatar, Divider, Flex, Text } from '@chakra-ui/react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
const Comment = ({ reply, lastReply }) => {
    const navigate = useNavigate();
    return (
        <>
            <Flex gap={4} py={2} my={2} w={"full"}>
                <Avatar src={reply.userProfilePic} size={"sm"} onClick={() => navigate(`/${reply.username}`)} cursor={"pointer"} />
                <Flex gap={1} w={"full"} flexDirection={"column"}>
                    <Flex w={"full"} justifyContent={"space-between"} alignItems={"center"}>
                        <Text fontSize={"sm"} fontWeight={"bold"} onClick={() => navigate(`/${reply.username}`)} cursor={"pointer"}>{reply.username}</Text>
                    </Flex>
                    <Text>{reply.text}</Text>
                </Flex>
            </Flex>
            {!lastReply ? <Divider /> : null}

        </>
    )
}

export default Comment