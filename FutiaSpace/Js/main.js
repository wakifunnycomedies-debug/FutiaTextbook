import { auth, onAuthChange } from "./firebase-config.js";
import { register, login, logout } from "./auth.js";
import { createPost, listenPost, toggleLike, toggleBookmark } from "./db";
import { uploadPhoto } from "./storage.js";
import { getUserProfile, followUser, unfollowUser, listenNotifications, markNotifRead } from "./db";
import { renderNotification, renderPost, renderProfile } from "./ui.js";

const pages = {
    login: () => document.body.dataset.page = 'login',
    signup: () => document.body.dataset.page = 'signup',
    home: () => document.body.dataset.page = 'home',
    profile: () => document.body.dataset.page = 'profile',
    notification: () => document.body.dataset.page = 'notifications',
};

const requiredAuth = (cb) => {
    onAuthChange(user => {
        if (user) cb(user);
        else location.href = 'login.html';
    });
};

/* ------- COMMON ------------ */
document.addEventListener('click', e => {
    if (e.target.id === 'logoutBtn') {
        logout().then(() => location.href ='login.html');
    }
});

/* ------- LOGIN -------- */
if (location.pathname.includes('login.html')) {
    $('#loginBtn')?.addEventListener('click', async () => {
        const email = $('#email').value.trim();
        const password = $('#password').value;
        try {
            await login(email, password);
            location.href = 'index.html'; 
        } catch (e) { alert(e.message); }
    });
}

/* ------- SIGNUP -------- */
if (location.pathname.includes('signup.html')) {
    $('#signupBtn')?.addEventListener('click', async () => {
        const name = $('displayName').value.trim();
        const password = $('#password').value;
        try  {
             await register(email, password, name);
            location.href = 'index.html';
        } catch (e) { alert(e.message); }
    });
}

/* ------ HOME (FEED) -------- */
if (location.pathname === '/' || location.pathname.includes('index.html')) {
    requiredAuth(async (user) => {
  // New post
  $('#postBtn').onclick = async () => {
    const caption = $('#postCaption').value.trim();
    const file = $('#postImage').files[0];
    if (!caption && !file) return alert('Add something');
   
    let imageUrl = '';
    if (file) imageUrl = await uploadPhoto(file, user, uid);

    // extract hashtags 
    const hashtags = caption.match(/#\w+/g) || [];

    await createPost(user, uid, caption, imageUrl, hahtags);
    $('#postCaption').value = '';
  };

  // Real-time feed 
  const feed = $('feed');
  const unsub = listenPost(async posts => {
    feed.innerHTML = '';
    for (const p of posts) {
        const el = await renderPost(p);
        feed.appendChild(el);
    }
  });



// cleanup 
window.addEventListener('unload', unsub);
});
}

/*--------- PROFILE --------*/
if (location.pathname.includes('profile.html')) {
    requiredAuth(async (user) => {
        const uid = new URLSearchParams(location.search).get('uid') || user.uid;
        const section = $('#profileSection');
        section.innerHTML = await renderProfile(uid);

        // Follow button 
        const followBtn = section.querySelector('.followBtn');
        if (followBtn) {
            followBtn.onclick = async () => {
                const target = uid;
                if (followBtn.textContent === 'Follow') {
                    await unfollowUser(user.uid, target);
                    followBtn.textContent = 'Follow';
                }
            };
        }
    
    // Load user's posts
    const userPost = $('#userPosts');
    const unsub = listenPost(async posts => {
        const mine = posts.filter(p => p.uid === uid);
        for (const p of mine) {
            const el = await renderPost(p);
            userPosts.appendChild(el);
        }
    });
    window.addEventListener('unload', unsub);
    });
 }

 /* ---------- NOTIFICATIONS ----------*/
 if (location.pathname.includes('notifications.html')) {
    requiredAuth(async (user) => {
        const list = $('#notifList');
        const unsub = listenNotifications(user.uid, async notifs => {
            list.innerHTML = '';
            for (const n of notifs) {
                const html = await renderNotification(n);
                const div = document.createElement('div');
                div.onclick = () => markNotifRead(user.uid, n.id);
            }
            list.appendChild(div.firstChild);
        });
        window.addEventListener('unload', unsub);
    });
 }

