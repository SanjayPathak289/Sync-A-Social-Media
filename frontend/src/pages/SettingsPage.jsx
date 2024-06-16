import { AlertDialog, AlertDialogBody, AlertDialogCloseButton, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, Flex, Text, useDisclosure } from '@chakra-ui/react'
import React from 'react'
import useShowToast from '../hooks/useShowToast';
import useLogout from '../hooks/useLogout';

const SettingsPage = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const showToast = useShowToast();
    const logout = useLogout();
    const disableAccount = async () => {
        try {
            const res = await fetch("/api/users/disable", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            if (data.success) {
                await logout();
                showToast("Success", "Your account has been disabled", "success");
            }

        } catch (error) {
            showToast("Error", error.message, "error");
        }
    }
    return (

        <Flex flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
            <Text my={1} fontWeight={"bold"}>
                Disable Your Account
            </Text>
            <Text my={1}>You can enable your account anytime by logging in</Text>
            <Button
                size={"sm"}
                colorScheme='red'
                onClick={onOpen}
                marginTop={3}>
                Disable
            </Button>
            <AlertDialog
                motionPreset='slideInBottom'
                onClose={onClose}
                isOpen={isOpen}
                isCentered>
                <AlertDialogOverlay />

                <AlertDialogContent>
                    <AlertDialogHeader>Disable Account?</AlertDialogHeader>
                    <AlertDialogCloseButton />
                    <AlertDialogBody>
                        Are you sure you want to disable your account ?
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button onClick={onClose}>
                            No
                        </Button>
                        <Button colorScheme='red' ml={3} onClick={disableAccount}>
                            Yes
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Flex>

    )
}

export default SettingsPage