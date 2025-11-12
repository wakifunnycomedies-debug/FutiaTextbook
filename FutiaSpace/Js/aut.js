import { auth } from "./firebase-config.js";
import {
    createUserWithEmailAndPassword,
    signinWithEmailAndPassword,
    signOut,
    onAuthStateChange,
    updateProfile
}  from "https://www.gstatic.com/firebase/10.14.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

export const register = async (email, Password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, {displayName });
    await setDoc(doc(db, "user", cred.user.uid)), {
        displayName,
        email,
        photoURL: "",
        bio: "",
        followers: [],
        friends: [],

    }};

    export const  login = (email, password) =>
     signinWithEmailAndPassword(auth, email, password).then(c => c.user);

    export const logout = () => signOut(auth);

    export const onAuthStateChange = (cb) => onAuthStateChange(auth, cb);
    
    