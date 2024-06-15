import { Button, Flex, Image, useColorMode, Text } from "@chakra-ui/react"
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Link } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import useLogout from "../hooks/useLogout";
import { FiLogOut } from "react-icons/fi";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";

const Header = () => {
    const { colorMode, toggleColorMode } = useColorMode();

    const user = useRecoilValue(userAtom);
    const handleLogout = useLogout();
    return (
        <Flex justifyContent={user ? "space-between" : "center"} mt={6} mb={12}>
            {user && (
                <Link to="/">
                    <AiFillHome size={24} />
                </Link>
            )}
            <Image
                cursor={"pointer"}
                alt="Logo"
                width={6}
                src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
                onClick={toggleColorMode}
            />
            {user && (
                <Flex alignItems={"center"} gap={4}>
                    <Link to={`/${user.username}`}>
                        <RxAvatar size={24} />
                    </Link>
                    <Link to={`/chat`}>
                        <BsFillChatQuoteFill size={20} />
                    </Link>
                    <Link to={`/settings`}>
                        <MdOutlineSettings size={20} />
                    </Link>
                    <Button
                        size={"sm"} onClick={handleLogout}>
                        <FiLogOut size={20} />
                    </Button>
                </Flex>
            )}
        </Flex>
    )
}

export default Header