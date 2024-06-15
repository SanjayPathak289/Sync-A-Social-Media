import React, { useState } from 'react'
import useShowToast from './useShowToast';
import { useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';

const useFollowUnfollow = (user) => {
    const currentUser = useRecoilValue(userAtom);
    const [following, setFollowing] = useState(user.followers.includes(currentUser?._id));
    const [loading, setLoading] = useState(false);
    const showToast = useShowToast();
    const handleFollowUnfollow = async () => {
        if (!currentUser) {
            showToast("Error", "Please login", "error");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/users/follow/${user._id}`, {
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
            if (following) {
                user.followers.pop();
            }
            else {
                user.followers.push(currentUser?._id);
            }
            setFollowing(!following);
        } catch (error) {
            showToast("Error", error, "error");
        }
        finally {
            setLoading(false);
        }
    }

    return { handleFollowUnfollow, loading, following };
}

export default useFollowUnfollow