import React from 'react'
import SignupCard from '../components/SignUpCard'
import LoginCard from "../components/LoginCard"
import { useRecoilValue } from 'recoil';
import authScreenAtom from '../atoms/authAtom';

const AuthPage = () => {
    const authScreenState = useRecoilValue(authScreenAtom);
    return (
        <>
            {authScreenState === "login" ? <LoginCard /> : <SignupCard />}
        </>
    )
}

export default AuthPage