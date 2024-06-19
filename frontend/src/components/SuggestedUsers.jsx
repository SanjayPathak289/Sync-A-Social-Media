import { Box, Flex, Skeleton, SkeletonCircle, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import SuggestedUser from './SuggestedUser';
import useShowToast from '../hooks/useShowToast';

const SuggestedUsers = () => {
    const [loading, setLoading] = useState(true);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const showToast = useShowToast();
    useEffect(() => {
        const getSuggestedUsers = async () => {
            try {
                const res = await fetch("/api/users/suggested");
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                setSuggestedUsers(data);
            } catch (error) {
                showToast("Error", error.message, "error");
            }
            finally {
                setLoading(false);
            }
        }
        getSuggestedUsers();
    }, [showToast])
    return (
        <>

            {suggestedUsers.length > 0 && (
                <Text mb={4} fontWeight={"bold"}>
                    Suggested Users
                </Text>
            )}
            <Flex direction={"column"} gap={4}>
                {loading && (
                    [1, 2, 3, 4, 5].map((_, i) => (
                        <Flex key={i} gap={2} alignItems={"center"} p={1} borderRadius={"md"}>
                            <Box>
                                <SkeletonCircle size={10} />
                            </Box>
                            <Flex w={"full"} flexDirection={"column"} gap={2}>
                                <Skeleton h={"8px"} w={"80px"} />
                                <Skeleton h={"8px"} w={"90px"} />
                            </Flex>
                            <Flex>
                                <Skeleton h={"20px"} w={"60px"} />
                            </Flex>

                        </Flex>
                    ))
                )}
                {
                    !loading && (
                        suggestedUsers.map((user) => (
                            <SuggestedUser key={user._id} user={user} />
                        ))
                    )
                }
            </Flex>
        </>
    )
}

export default SuggestedUsers