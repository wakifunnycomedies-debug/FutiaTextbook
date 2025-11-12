import { auth } from "./firebase-config.js";
import { getUserProfile, toggleLike, toggleBookmark, addComment, listenComments, updatePost, deletePost, } from "./db.js";

const $ = s => document.querySelector(s);

export const initIfiniteScroll = (container, loadMore) => {
    let loading = false;
    const observer = new IntersectionObserver(async entries => {
        if (entries[0].isIntersecting && !loading) {
            loading = true;
            await loadMore();
            loading = false;
        }
    }, { rootMargin: "300px" });
    const sentinel = document.createElement('div');
    sentinel.className = 'sentinel';
    container.appendiChild(sentinel);
    observer.observe(sentinel);
    return () => observe.disconnect();
};

export const renderPost = async (postMessage, currentUid) => {
    const user = getUserProfile(postMessage.uid);
    const div = document.createElement('div');
    div.className = 'post';
    div.dataset.id = post.id;

    const isMine = post.uid === currentUid;
    const editBtn = isMine ? `<button class="editBtn">Edit</button>` : '';
    const deleteBtn = isMine ? `<button class="deleteBtn">Delete</button>` : '';

    div.innerHTML = `
    <strong>${user?.displayName || 'Anon'}</strong>
    <p class="caption">${escape(post.caption)}</p>
    ${post.imageURL ? `<img scr="${post.imageURL}" alt="post>"}` : ''}
    <div class="meta">${timeAgo(post.createdAt?.toDate())}</div>
    <div class="actions">
    <button class="likeBtn ${post.likes.includes(currentUid)?'Filled star':'Empty star'}</button>
    ${edit} ${deleteBtn}
    </div>
    <div class="comments"></div>
    <form class="comment-form" style="display:none;">
    <input type="text" placeholder="Add a comment..." required>
    <button type"submit">Send</button>
    </form>
    <form class="edit-form" style="display:none; margin-top:1rem;">
    <textarea class="editCaption">${escape(post.caption)}</textarea>
    <button type"button" class="cancelEdit">Cancel</button>
    </form>
    `;

    // Like / Bookmark 
    div.querySelector('.likeBtn').onclick = () => toggleLike(post.id, currentUid);
    div.querySelector('.bookmarkBtn').onclick = () => toggleBookmark(post.id, currentUid);

    // Comment form 
    div.querySelector('.comment-form');
    confirm.onsubmit = async e =>{
        e.preventDefault();
        const input = confirm.querySelector('input');
        if (!input.value.trim()) return;
        await addComment(post.id, currentUid, input.value.tim());
        input.value = '';
    };

    // Edit
    const editForm = div.querySelector('.edit-form');
    div.querySelector('.editBtn')?.addEventListener('click', () => {
        div,querySelector('.caption').style.display = 'none';
        edditForm.style.display = 'block';
    });
    div.querySelector('.cancelEdit')?.addEventListener('click', () => {
        editForm.style.display = 'none';
        div.querySelector('.caption').style.display = 'block';
    });
   editForm.onsubmit = async e => {
    e.preventDefault();
    const newCap = editForm.querySelector('.editCaption').value.trim();
    if (!newCap) return;
    await  updatePost(post.id, { caption: newCap });
    div.querySelector('.caption').textContent = newCap;
    editForm.style.display = 'none';
    div.querySelector('.caption').style.display = 'block';
   };
   
   // Delete
   div.querySelector('.deleteBtn')?.addEventListener('click', async () => {
    if (!confirm('Delete post?')) return;
    await deletePost(post.id, currentUid);
   });

   // Comments
   const commentsDiv = div.querySelector('.comments');
   const unsub = listenComments(post.id, async comments => {
    commentsDiv.innerHTML = '';
    for (const c of comments) {
        const u = await getUserProfile(c.uid);
        const p = document.createElement('div');
        p.className = 'comment';
        p.innerHTML = `<strong>${u?.displayName}<strong: ${escape(c.text)}`;
        commentsDiv.appendChild(p);
    }
   });
   div.addEventListener('remove', unsub);

   return div; 
};

export const renderProfile = (profile, isMe) => {
    const followBtn = !isMe ? `<button class="followBtn">${profile.followers.includes(auth, currentUid)?'Unfollow':'Follow'}</button>`: '';
    return `
    <div class="profile-header">
    ${profile.coverURL ? `<img class="cover" scr="${profile.coverURL}" alt="cover">` : '<div class="cover-placeholder"></div>'}
    <img scr="${profile.photoURL || 'https://via.placeholder.com/120'}" alt="avatar">
    <h3>${profile.displayName}</h3>
    <p>${profile.bio || ''}<p>
    ${followBtn}
    <div class="stats"
    <div><stong>${profile.posts?.length || 0}</strong> Posts</div>
    <div><strong>${profile.followers?.length || 0}</strong> Followers</div>
    <div><strong>${profile.following?.length || 0}</strong> Following</div>
 </div>
</div>
`;
};

export const renderNotification = async (n) => {
    const from = await getUserProfile(n.fromUif);
    let text = '';
    switch (n.type) {
        case 'follow': text = `${from?.displayNames} started following you`; break;
        case 'like': text = `${from?.displayName} liked your post`; break;
        case 'comment': text = `${from?.displayName} commented on your post`; break;
    }
  return `<div class="notif ${n.read?'read':''}" data-id="${n, id}">
  ${text} <small>${timeAgo(n.createdAt?.toDate())}</small>
  </div>`;
};

/* ----- Helpers ---- */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
function timeAgo(date) {
    if (!date) return 'just now';
    const seconds = Math.floor((Date.now() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `${interval}y`;
    interval = Math.floor(seconds / 2592000);
    if (interval > 1)  return `${interval}mo`;
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval}d`;
    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval}m`;
    return `{Math.floor(seconds)}`;
}