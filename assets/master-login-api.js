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

