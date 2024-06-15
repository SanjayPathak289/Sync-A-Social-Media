import { useEffect, useState } from "react"
import UserHeader from "../components/UserHeader"
import UserPost from "../components/UserPost"
import { useParams } from "react-router-dom";
import useShowToast from "../hooks/useShowToast"
import { Flex, Heading, Spinner } from "@chakra-ui/react";
import Post from "../components/Post";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";
const UserPage = () => {

    const { username } = useParams();
    const showToast = useShowToast();
    const [posts, setPosts] = useRecoilState(postsAtom);
    const [fetchingPosts, setFetchingPosts] = useState(true);
    const { loading, user } = useGetUserProfile();
    useEffect(() => {
        const getPost = async () => {
            if (!user) return;
            setFetchingPosts(true);
            try {
                const res = await fetch(`/api/posts/user/${username}`);
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                setPosts(data);

            } catch (error) {
                showToast("Error", error, "error");
                setPosts([])
            }
            finally {
                setFetchingPosts(false);
            }
        }
        getPost();
    }, [username, showToast, setPosts, user])


    if (!user && loading) {
        return (
            <Flex justifyContent={"center"}>
                <Spinner thickness='4px'
                    speed='0.65s'
                    emptyColor='gray.200'
                    color='gray.light'
                    size='xl' />
            </Flex>
        )
    }
    if (!user && !loading) return <Heading>User not found</Heading>;

    return (
        <>
            <UserHeader user={user} />
            {!fetchingPosts && posts.length === 0 && <Heading textAlign={"center"}>No Posts</Heading>}
            {fetchingPosts && (
                <Flex justifyContent={"center"} my={12}>
                    <Spinner size={"xl"} />
                </Flex>
            )}
            {
                posts.map((post) => (
                    <Post key={post._id} post={post} postedBy={post.postedBy} />
                ))
            }
        </>
    )
}

export default UserPage