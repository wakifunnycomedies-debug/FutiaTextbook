// db.js
let db;

const DB_NAME = 'FutiaTextbook';
const DB_VERSION = 2;
const STORE_NAME = 'post';

export function initDB() {
    return new Promise((resolve, reject) => {
const request = indexedDB.open(DB_NAME, DB_VERSION);

Request.onerror = () => reject(request.error);
db = request.onsuccess = () => {
    db = request.result;
    resolve(db);
};

request.onupgradeneeded = (e) => {
    db = e.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true});
       store.createIndex('timetamp', 'timestamp');
    }
};
    });
}

export function getStore(mode = 'readonly') {
    const tx = db.transaction(STORE_NAME, mode);
    return tx.objectStore(STORE_NAME);
}