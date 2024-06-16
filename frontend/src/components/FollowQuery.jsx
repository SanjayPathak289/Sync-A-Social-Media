import { Box, Flex, Skeleton, SkeletonCircle, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import FollowUnfollow from './FollowUnfollow';
import useShowToast from '../hooks/useShowToast';

const FollowQuery = () => {
    const { followQuery } = useParams();
    const { username } = useParams();
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const showToast = useShowToast();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const getFollowersFollowing = async () => {
            try {
                const res = await fetch(`/api/users/${username}/followQuery`);
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                }
                setFollowers(data.followers);
                setFollowing(data.following);
            } catch (error) {
                showToast("Error", error.message, "error");
            } finally {
                setLoading(false);
            }
        }
        getFollowersFollowing();
    }, [])
    return (
        <>
            {followQuery === "followers" && <Text mb={4} fontWeight={"bold"}>
                Followers
            </Text>}
            {followQuery === "following" && <Text mb={4} fontWeight={"bold"}>
                Following
            </Text>}

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
                    !loading && (followQuery === "followers") && (
                        followers.map((user) => (
                            <FollowUnfollow key={user._id} user={user} />
                        ))
                    )
                }
                {
                    !loading && (followQuery === "following") && (
                        following.map((user) => (
                            <FollowUnfollow key={user._id} user={user} />
                        ))
                    )
                }
            </Flex>
        </>
    )
}

export default FollowQuery