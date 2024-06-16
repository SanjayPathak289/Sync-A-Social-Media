import { Avatar, Box, Button, Flex, Heading, Menu, MenuButton, MenuItem, MenuList, Portal, Text, VStack, useColorMode, useColorModeValue } from '@chakra-ui/react'
import React, { useState } from 'react'
import { BsInstagram } from "react-icons/bs"
import { CgMoreO } from "react-icons/cg"
import { useRecoilValue } from "recoil"
import userAtom from "../atoms/userAtom"
import { Link } from "react-router-dom"
import useShowToast from '../hooks/useShowToast'
import useFollowUnfollow from '../hooks/useFollowUnfollow'
const UserHeader = ({ user }) => {
    const showToast = useShowToast();
    const copyURL = () => {
        const currentURL = window.location.href;
        navigator.clipboard.writeText(currentURL).then(() => {
            showToast("Copied", "", "success");
        })
    }
    const currentUser = useRecoilValue(userAtom);
    const { handleFollowUnfollow, loading, following } = useFollowUnfollow(user);
    const { colorMode } = useColorMode();
    return (
        <VStack gap={4} alignItems={"start"}>
            <Flex justifyContent={"space-between"} width={"full"}>
                <Box>
                    <Text fontSize={"2xl"} fontWeight={"bold"}>
                        {user.name}
                    </Text>
                    <Flex gap={2} alignItems={"center"}>
                        <Text fontSize={"sm"}>{user.username}</Text>

                    </Flex>
                </Box>
                <Box>
                    {user.profilePic && (<Avatar
                        name={user.name}
                        src={user.profilePic}
                        size={{
                            base: "md",
                            md: "xl"
                        }}
                    />)}
                    {!user.profilePic && (<Avatar
                        name={user.name}
                        src="https://bit.ly/broken-link"
                        size={{
                            base: "md",
                            md: "xl"
                        }}
                    />)}
                </Box>
            </Flex>
            <Text>{user.bio}</Text>
            {currentUser?._id === user._id && (
                <Link to='/update'>
                    <Button variant="solid" size={"sm"} bg={useColorModeValue("gray.300", "gray.light")} color={useColorModeValue("black", "white")}>Update Profile</Button>
                </Link>
            )}
            {currentUser?._id !== user._id && (
                <Button size={"sm"} onClick={handleFollowUnfollow}
                    isLoading={loading}>
                    {following ? "Unfollow" : "Follow"}
                </Button>
            )}
            <Flex w={"full"} justifyContent={"space-between"}>
                <Flex gap={2} alignItems={"center"}>
                    <Link to={`/${user.username}/followers`}>
                        <Text color={"gray.light"}>{user.followers.length} followers</Text>
                    </Link>
                    <Box w={1} h={1} bg={"gray.light"} borderRadius={"full"}></Box>
                    <Link to={`/${user.username}/following`}>
                        <Text color={"gray.light"}>{user.following.length} following</Text>
                    </Link>
                </Flex>
                <Flex>
                    <Box className='icon-container' _hover={{
                        backgroundColor: colorMode === 'light' ? 'gray.200' : 'gray.dark',
                    }}>
                        <Menu>
                            <MenuButton>
                                <CgMoreO size={24} cursor={"pointer"} />
                            </MenuButton>
                            <Portal>
                                <MenuList bg='gray.dark' color={'white'}>
                                    <MenuItem bg='gray.dark' onClick={copyURL}>Copy link</MenuItem>
                                </MenuList>
                            </Portal>
                        </Menu>
                    </Box>
                </Flex>
            </Flex>

            <Flex width={"full"}>
                <Flex flex={1} borderBottom={colorMode === "light" ? "1.5px solid black" : "1.5px solid white"} justifyContent={"center"} pb={3} cursor={"pointer"}>
                    <Heading>Posts</Heading>
                </Flex>
            </Flex>
        </VStack>
    )
}

export default UserHeader