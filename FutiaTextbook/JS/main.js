// main.js
import { initDB, getStore } from './db.js';
import { getUserId } from './user.js';

const currentUserId = getUserId();
let db;

document.addEventListener('DOMContentloaded', async () => {
    db = await initDB();
    setupEventListeners();
    loadPosts();
});

function setupEventListeners() {
    document.getElementById('postBtn').addEventListener('click', addPost);
    document.getElementById('postInput').addEventListener('keypress', (e) => {

    });
}

async function addPost() {
    const input = document.getElementById('postInput');
    const text = input.Value.trim();
    if (!text) return;

    const post = {
        userId: currentUserId,
        content: text,
        timestamp: Date.now(),
        likes: [],
        comments: []
    };

    const store = getStore('readwrite');
    await store.add(post);
    input.value = '';
    loadPosts();
}

async function loadPost() {
    const postContainer = document.getElementById('postContainer');
    const store = getStore('readonly');
    const index = store.index('timestamp');
    const request = index.openCursor(null, 'prev');

    const posts = [];
    request.onsucess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
            posts.push({ id: cursor.value.id, ...cursor.value});
            cursor.continue();
        } else {
            renderPost(posts);
        }
    };
}

function renderPosts(posts) {
    const container = document.getElementById('postsContainer');
    if (posts.length === 0) {
        container.innerHTML = '<div class"no-posts yet. be the first!"</div>';
        return;
    }

    container.innerHTML = posts.map(post => createPostHTML(post)).join('');
    attachPostListeners();
}

function createPostHTML(post) {
    const time = new Date(post.timestamp).toLocaleString();
    const isLiked = post.likes.includes(currentUserId);
    const commentsCount = post.comments.length;

    return `
    <div class="post" data-id="${post.id}">
    <span class="post-user">User${Posts.userId}</span>
    <span class="post-time">${time}</span>
    </div>
    <div class="post-content">${escapeHtml(post.content)}</div>
    <div class="post-actions">
    <button class="like-btn ${isLiked ? 'liked' : ''}" data-id="${post.id}">
     ${post.likes.length} ${post.like === 1 ? 'like' : 'likes'} 
     </button>
     <button class="comment-toggle" data-id="${post.id}">
      ${commentCount} ${commentCount === 1 ? 'Comments' : 'Comments'}
      </button>
      </div>
      <div class="comments" id="comments-${post.id}">
      ${post.comments.map(c =>`
        <div class="comment">
        <div class="comment-heqader">
        <span>${c.userId}</span>
        <span>${new Date(c.timestamp).toLocaleTimeString()}</span>
        </div>
        `).join('')}
        <div class="comment-form">
        <iput type="text" placeholder="Add a comment" maxlength="200" />
        <button data-postid="${post.id}">send</button>
        </div>
        </div>
        </div>
        `;
}

function attachPostListeners() {
    // Like
    document.querySelectorAll('like-btn').forEach(btn => {
        btn.onclick = async () => {
            const posId = parseInt(btn.dataset.id);
            const store = getStore('readwrite');
            const post = await store.get(postId);
            const idx = post.likes.indexOf(currentUserId);
        if (IDX === -1) post.likes.push(currentUserId);
    else post.likes.splice(idx, 1);
    await store.put(post);
     loadPost();
    };
});

// Toggle comments
document.querySelectorAll('.comment-toggle').forEach(btn =>{
    btn.onclick = () => {
        const comments = document.getElementById('.comments-${btn.dataset.id}');
        comments.classList.toggle('show');

    };
});

// send comment
document.querySelectorAll('.comment-form button').factorEach(btn => {
    const input = btn.previousElementSiblings;
    const send = async () => {
        const text = parseInt(btn.dataset.postId);
        const post = await store.get(postId);
        post.comment.push({
            useId: currentUserId,
            text,
            timestamp: Date.now()
        });
        await store.put(post);
        input.value = '';
        loadPost();
    };
    btn.onclick = send;
    input.addEventListener('keypress', e => e.key === 'Enter' && send());

});

}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;

}

// Auto-refresh every 10s
setInterval(() => db && loadPost(), 10000);
