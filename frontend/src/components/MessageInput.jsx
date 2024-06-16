import { Flex, Image, Input, InputGroup, InputRightElement, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Spinner, useDisclosure } from '@chakra-ui/react'
import React, { useRef, useState } from 'react'
import { IoSendSharp } from 'react-icons/io5'
import useShowToast from '../hooks/useShowToast';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import conversationsAtom, { selectedConversationAtom } from '../atoms/conversationsAtom';
import { BsFillImageFill } from 'react-icons/bs';
import usePreviewImage from '../hooks/usePreviewImage';

const MessageInput = ({ setMessages }) => {
    const [messageText, setMessageText] = useState("");
    const showToast = useShowToast();
    const selectedConversation = useRecoilValue(selectedConversationAtom);
    const setConversations = useSetRecoilState(conversationsAtom);
    const imageRef = useRef(null);
    const { onClose } = useDisclosure();
    const { handleImageChange, imgUrl, setImgUrl } = usePreviewImage();
    const [isSending, setIsSending] = useState(false);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText && !imgUrl) return;
        if (isSending) return;
        setIsSending(true);
        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: messageText,
                    img: imgUrl,
                    recipientId: selectedConversation.userId
                })
            })
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
            }
            console.log(data);
            setMessageText("");
            setImgUrl("");
            setMessages((messages) => [...messages, data]);
            setConversations(prevConvers => {
                const updatedConvers = prevConvers.map((conv) => {
                    if (conv._id === selectedConversation._id) {
                        return {
                            ...conv,
                            lastMessage: {
                                text: messageText,
                                sender: data.sender
                            }
                        }
                    }
                    return conv;
                })
                return updatedConvers;
            })
        } catch (error) {
            showToast("Error", error.message, "error");
        }
        finally {
            setIsSending(false);
        }
    }
    return (
        <Flex gap={2} alignItems={"center"}>
            <form onSubmit={handleSendMessage} style={{ flex: 95 }}>
                <InputGroup>
                    <Input type='text' w={"full"} placeholder='Message' value={messageText} onChange={(e) => setMessageText(e.target.value)} border={"1px solid rgba(0,0,0,0.2)"} />
                    <InputRightElement onClick={handleSendMessage} cursor={"pointer"}>
                        <IoSendSharp />
                    </InputRightElement>
                </InputGroup>
            </form>
            <Flex flex={5} cursor={"pointer"}>
                <BsFillImageFill size={20} onClick={() => imageRef.current.click()} />
                <Input type='file' hidden ref={imageRef} onChange={handleImageChange} />
            </Flex>
            <Modal
                isOpen={imgUrl}
                onClose={() => {
                    onClose()
                    setImgUrl("")
                }}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader></ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex mt={5} w={"full"}>
                            <Image src={imgUrl} />
                        </Flex>
                        <Flex justifyContent={"flex-end"} my={2}>
                            {!isSending ? (<IoSendSharp size={24} cursor={"pointer"} onClick={handleSendMessage} />) : (
                                <Spinner size={"md"} />
                            )}
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Flex>
    )
}

export default MessageInput