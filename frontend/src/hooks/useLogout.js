import React from 'react'
import useShowToast from './useShowToast';
import { useSetRecoilState } from 'recoil';
import userAtom from '../atoms/userAtom';

const useLogout = () => {
    const setUser = useSetRecoilState(userAtom);
    const showToast = useShowToast();
    const handleLogout = async () => {
        try {
            const res = await fetch("/api/users/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
            })
            const data = await res.json();
            if (data.error) {
                showToast("Error", data.error, "error");
                return;
            }
            localStorage.removeItem("user");
            setUser(null);
        } catch (error) {
            useShowToast("Error", error, "error");
        }
    }
    return handleLogout;
}

export default useLogout