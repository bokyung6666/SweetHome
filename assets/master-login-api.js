// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCzdwksNCn-s97M0kkL9lm-UO7FCT6rZkQ",
  authDomain: "sweethmoe-d61d0.firebaseapp.com",
  projectId: "sweethmoe-d61d0",
  storageBucket: "sweethmoe-d61d0.firebasestorage.app",
  messagingSenderId: "556294938952",
  appId: "1:556294938952:web:072e0d46d449f0cd4dd37d",
  measurementId: "G-9GQ3KD8K9S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// login.js - 최종 코드

const form = document.getElementById('masterLoginForm');
const passwordInput = document.getElementById('masterPass');
const loginMsg = document.getElementById('loginMsg');

const MASTER_PASSWORD = '1234';

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const password = passwordInput.value.trim();
    
    if (!password) {
        loginMsg.textContent = '❌ 비밀번호를 입력해주세요.';
        loginMsg.style.color = 'red';
        return;
    }
    
    loginMsg.textContent = '🔄 인증 중...';
    loginMsg.style.color = '#666';
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (password === MASTER_PASSWORD) {
        sessionStorage.setItem('isMaster', 'true');
        sessionStorage.setItem('loginTime', new Date().toISOString());
        
        loginMsg.textContent = '✅ 인증 성공! 이동 중...';
        loginMsg.style.color = 'green';
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } else {
        loginMsg.textContent = '❌ 비밀번호가 올바르지 않습니다.';
        loginMsg.style.color = 'red';
        passwordInput.value = '';
        passwordInput.focus();
    }
});
```


