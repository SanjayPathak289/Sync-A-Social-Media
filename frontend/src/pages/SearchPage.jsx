import { Flex, Heading, Input } from '@chakra-ui/react'
import React, { useState } from 'react'
import useShowToast from '../hooks/useShowToast';
import SuggestedUser from '../components/SuggestedUser';

const SearchPage = () => {
    const [searchUsers, setSearchUsers] = useState([]);
    const showToast = useShowToast();
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);
    const handleSearchUser = async (searchText) => {
        if (!searchText) {
            setSearchUsers([]);
            return;
        };
        if (loading) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/users/search/${searchText}`);
            const data = await res.json();
            setSearchUsers(data);
        } catch (error) {
            showToast("Error", error.message, "error");
        } finally {
            setLoading(false);
        }
    }
    return (
        <Flex w={"full"} flexDirection={"column"} alignItems={"center"} gap={6}>
            <Flex alignItems={"center"} gap={2} w={"full"}>
                <Input type='text' placeholder='Search user' border={"1px solid rgba(0,0,0,0.2)"} onChange={(e) => {
                    setSearchText(e.target.value);
                    handleSearchUser(e.target.value);
                }} />
            </Flex>
            <Flex flexDirection={"column"} justifyContent={"center"} alignItems={"center"} gap={10} w={{
                "base": "100%",
                "md": "80%"
            }}>
                {searchUsers.map((user) => (
                    <SuggestedUser key={user._id} user={user} />
                ))}
                {searchText && !loading && searchUsers.length === 0 && <Heading>No users found</Heading>}
            </Flex>
        </Flex>
    )
}

export default SearchPage