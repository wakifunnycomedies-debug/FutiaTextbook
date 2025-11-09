// user.js
export function getUserId() {
    let id = localStorage.getItem('FutiaTextbookuserId');
    if (!id) {
        const total = (parseInt(localStorage.getItem('totalUsers') || '0')) + 1;
    localStorage.setItem('totalUsers', total);
   id = total;
   localStorage.setItem('FutiaTextbookUserId', id);
}
return parseInt(id);
}