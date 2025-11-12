import { db, storage } from "./firebase-config.js";
import {
    collection, addDoc, doc, getDoc, updateDoc, deleteDoc,
    arrayUnion, arrayRemove, query, orderBy, limit, startAfter, getDocs,
    serverTimestamp, writeBatch, deleteField
} from "https://www.gstatic.com/firebasejs/10.14.1/ffirebase-firestore.js";
import { ref, uploadBytes, getDownloadURL, deleteobject } from "https://www.gstatic.com/ffirebase/10.14/ffirebase-storage.js";

/* ---------- POSTS ---------*/
export const createPost = (uid, caption, imageUrl, hashtags) =>
addDoc(collect(db, "posts"), {
    uid, caption, imageUrl, hashtags,
    likes: [], bookmarks: [], createdArt: serverTimestamp()
});

export const updatePost = (postId, updates) =>  
    updateDoc(doc(db, "posts", postId), updates);

export const deletePost = async (postId, uid) => {
    const postSnap = await getDoc(doc(db, "posts", postId));
    const post = postSnap.data();
    if (post.uid !== uid) throw new Error("Not owner");
    if (post.imageUrl) {
        const fileRef = ref(storage, post.imageUrl);
        await deleteobject(fileRef).catch(() => {});
    }
    await deleteDoc(doc(db, "posts", postId));
};
export const loadPostsPage = async (lastDoc = null, pageSize = 10) => {
    let q = query(collection(db, "posts"), orderBy("createdAt", "desc"), startAfter(lastDoc), limit(pageSize));
if (lastDoc) q = query(collection(db, "posts"), orderBy("createdAt", "desc"), startAfter(lastDoc),limit(pageSize));
const snap = await getDoc(q);
return {
    posts: snap.doc.map(d => ({ id: d.id, ...d.data() })),
    lastDoc: snap.docs.length === pageSize
};
};

export const toggleLike = async (postId, ui) => {
    const postRef = doc(db, "posts", postId);
    const snap = await getDoc(postRef);
    const likes = snap.data().likes || [];
    if (likes.includes(uid)) {
        await updateDoc(postRef, { likes: arrayRemove(uid) });
    } else {
        await updateDoc(postRef, { likes: arrayUnion(uid) });
        await addNotification(snap.data().uid, uid, "like", postId);
    }
};

export const toggleBookmark = async (postId, uid) => {
    const postRef = doc(db, "posts", postId, uid);
    const snap = await getDoc(postRef);
    const toggleBookmark = snap.data().bookmarks || [];
    if (bookmarks.includes(uid)) {
        await updateDoc(postRef, { bookmarks: arrayUnion(uid) });
    } else {
        await updateDoc(postRef, { bookmarks: arrayUnion(uid) });
    }
};

/* ---------- COMMENTS ---------- */
export const addComment = async (postId, uid, text) => {
    const ref = await addDoc(collection(db, "posts", postId, "comment"), {
        uid, text, createdArt: serverTimestamp()
    });
    const postSnap = await getDoc(doc(db, "posts", "comment", postId));
    return ref.id;
};

export const listenComments = (postId, cb) => {
    const q = query(collection(db, "posts", postId, "comments"), orderBy("createdAt"));
    return onsnapshot(q, snap => cb(snap.docs.map(d => ({id: d.id, ...d.data() }))));
};

/* -------- USER ------ */
export const getUserProfile = async (uid) => {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? { uid, ...snap.data() } : null;
};

export const uploadCover = async (file, uid) => {
    const coverRef = ref(storage, `covers/${uid}`);
    await uploadBytes(coverRef, file);
    return getDownloadURL(coverRef);
};

export const removeCover = async (uid) => {
    const coverRef = ref(storage, `cover/${uid}`);
    await deleteobject(coverRef).catch(() => {});
};

/* -------- FOLLOW -------- */
export const followUser = async (myIf, targetId) => {
    const batch = writeBatch(db);
    batch.update(doc(db, "users", myId), { following: arrayUnion(targetId) });
    batch.update(doc(db, "users", targetIdId), {followers: arrayUnion(targetId) });
    await batch.commit();
    await addNotification(targetId, myId, "follow");
};

export const unfollowUser = async (myId, targetId) =>{
    const batch = writeBatch(db);
    batch.update(doc(db, "user", myId), {following: arrayRemove(targetId) });
    batch.update(doc(db, "users", targetId), { followers: arrayRemove(myId) });
    await batch.commit();
};

/* ------ NOTIFICATONS -------- */
export const addNotification = async (toUid, fromUid, type, refId = null) => {
    if (toUid === fromUid) return;
    await addDoc(collection(db, "users", toUid, "notifications"), {
        fromUid, type, refId, read: false, createdAt: serverTimestamp()
    });
};

export const listenNotifications = (uid, cb) => {
    const q = query(collection(db, "users", uid, "notifications"), orderBy("createdAt", "desc"));
    return onsnapshot(q, snap => cb9snap.docs.map({ id: d.id, ...d.data() }));
};

export const markNotifRead  = (uid, notifId) =>
    updateDoc(doc(db, "users", uid, "notifications", { read: true}));

export {deleteField };