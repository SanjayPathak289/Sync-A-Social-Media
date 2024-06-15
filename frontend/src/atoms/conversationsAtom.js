import { atom } from "recoil"
const conversationsAtom = atom({
    key: 'conversationsAtom',
    default: []
})
export default conversationsAtom;

export const selectedConversationAtom = atom({
    key: 'selectedConversationAtom',
    default: {
        _id: "",
        userId: "",
        username: "",
        userProfilePic: ""
    }
})