// login.html에서 사용할 API 연동 스크립트

const API_URL = window.location.origin;
const form = document.getElementById('masterLoginForm');
const passwordInput = document.getElementById('masterPass');
const loginMsg = document.getElementById('loginMsg');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const password = passwordInput.value;
    
    if (!password) {
        loginMsg.textContent = '❌ 비밀번호를 입력해주세요.';
        loginMsg.style.color = 'red';
        return;
    }
    
    // 로딩 표시
    loginMsg.textContent = '🔄 인증 중...';
    loginMsg.style.color = '#666';
    
    try {
        const response = await fetch(`${API_URL}/api/auth/master`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 세션에 저장
            sessionStorage.setItem('isMaster', 'true');
            
            loginMsg.textContent = '✅ 인증 성공! 이동 중...';
            loginMsg.style.color = 'green';
            
            // 1초 후 메인 페이지로 이동
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            loginMsg.textContent = '❌ ' + result.message;
            loginMsg.style.color = 'red';
            passwordInput.value = '';
            passwordInput.focus();
        }
    } catch (error) {
        console.error('로그인 실패:', error);
        loginMsg.textContent = '❌ 서버 연결에 실패했습니다.';
        loginMsg.style.color = 'red';
    }
});
