// characters.html에서 사용할 API 연동 스크립트

const API_URL = window.location.origin;
const characterContainerEl = document.querySelector("#character-cards");
const modal = document.getElementById("character-modal");
const inputName = document.getElementById("char-name");
const inputImg = document.getElementById("char-img");
const btnSubmit = document.getElementById("char-add-submit");
const btnCancel = document.getElementById("char-add-cancel");
const masterModal = document.getElementById("master-auth-modal");
const masterInput = document.getElementById("master-password");
const masterSubmit = document.getElementById("master-auth-submit");
const masterCancel = document.getElementById("master-auth-cancel");
const adminControls = document.getElementById("admin-controls");

let isMaster = sessionStorage.getItem('isMaster') === 'true';
let characters = [];

// 마스터 권한 확인 (페이지 로드 시 즉시 반영)
function updateUIBasedOnAuth() {
    if (isMaster) {
        adminControls?.classList.remove("hidden");
        console.log("✅ 마스터 모드 활성화");
    } else {
        adminControls?.classList.add("hidden");
        console.log("🔒 일반 사용자 모드");
    }
}

// 캐릭터 불러오기
async function loadCharacters() {
    try {
        const response = await fetch(`${API_URL}/api/characters`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        characters = await response.json();
        console.log('캐릭터 로드 완료:', characters.length + '개');
        renderCards();
    } catch (error) {
        console.error('캐릭터 로드 실패:', error);
        
        // 폴백: 기본 캐릭터 표시
        characters = [
            { id: 1, name: "초록개구리", img: "assets/char1.png" },
            { id: 2, name: "푸른용", img: "assets/char2.png" },
            { id: 3, name: "붉은라지", img: "assets/char3.png" }
        ];
        
        console.log('폴백 데이터 사용');
        renderCards();
    }
}

// 캐릭터 카드 렌더링
function renderCards() {
    if (!characterContainerEl) {
        console.error('character-cards 요소를 찾을 수 없습니다.');
        return;
    }

    characterContainerEl.innerHTML = "";
    
    if (characters.length === 0) {
        characterContainerEl.innerHTML = "<p style='text-align:center; padding:20px; color:#666;'>등록된 캐릭터가 없습니다.</p>";
        return;
    }

    characters.forEach((char) => {
        const card = document.createElement("div");
        card.className = "my-character-card";
        
        // 이미지 URL 처리 (상대경로 또는 절대경로)
        const imgSrc = char.img.startsWith('data:') || char.img.startsWith('http') 
            ? char.img 
            : `${API_URL}/${char.img}`;
        
        card.innerHTML = `
            <img src="${imgSrc}" alt="${char.name}" onerror="this.src='assets/placeholder.png'">
            <a href="#" onclick="return false;">${char.name}</a>
            ${isMaster ? `<button class="delete-btn" data-id="${char.id}">삭제</button>` : ""}
        `;
        
        characterContainerEl.appendChild(card);
    });

    // 삭제 버튼 이벤트 (마스터만)
    if (isMaster) {
        attachDeleteListeners();
    }
}

// 삭제 버튼 이벤트 리스너 연결
function attachDeleteListeners() {
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            e.stopPropagation();
            
            const id = e.target.dataset.id;
            const charName = e.target.previousElementSibling.textContent;
            
            if (!confirm(`'${charName}' 캐릭터를 삭제하시겠습니까?`)) return;
            
            try {
                const response = await fetch(`${API_URL}/api/characters/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    console.log('캐릭터 삭제 완료:', id);
                    await loadCharacters();
                } else {
                    throw new Error('삭제 요청 실패');
                }
            } catch (error) {
                console.error('삭제 실패:', error);
                alert('캐릭터 삭제에 실패했습니다.');
            }
        });
    });
}

// 마스터 인증
if (masterSubmit) {
    masterSubmit.addEventListener("click", async () => {
        const password = masterInput.value.trim();
        
        if (!password) {
            alert('비밀번호를 입력해주세요.');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/api/auth/master`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                isMaster = true;
                sessionStorage.setItem('isMaster', 'true');
                updateUIBasedOnAuth();
                masterModal.classList.remove("active");
                masterInput.value = '';
                
                console.log('마스터 인증 성공');
                alert('마스터 권한이 부여되었습니다.');
                
                // 카드 다시 렌더링 (삭제 버튼 표시)
                renderCards();
            } else {
                alert(result.message || '비밀번호가 올바르지 않습니다.');
                masterInput.value = '';
                masterInput.focus();
            }
        } catch (error) {
            console.error('인증 실패:', error);
            alert('인증 요청에 실패했습니다. 서버를 확인해주세요.');
        }
    });
}

// 마스터 인증 모달 닫기
if (masterCancel) {
    masterCancel.addEventListener("click", () => {
        masterModal.classList.remove("active");
        masterInput.value = '';
    });
}

// 캐릭터 추가 모달 열기
const addCharBtn = document.getElementById("add-character-btn");
if (addCharBtn) {
    addCharBtn.addEventListener("click", () => {
        if (!isMaster) {
            masterModal.classList.add("active");
            masterInput.focus();
            return;
        }
        
        modal.classList.add("active");
        inputName.value = "";
        inputImg.value = "";
        inputName.focus();
    });
}

// 캐릭터 추가 모달 닫기
if (btnCancel) {
    btnCancel.addEventListener("click", () => {
        modal.classList.remove("active");
        inputName.value = "";
        inputImg.value = "";
    });
}

// 캐릭터 추가
if (btnSubmit) {
    btnSubmit.addEventListener("click", async () => {
        const name = inputName.value.trim();
        const file = inputImg.files[0];
        
        if (!name) {
            alert("캐릭터 이름을 입력해주세요.");
            inputName.focus();
            return;
        }
        
        if (!file) {
            alert("캐릭터 이미지를 선택해주세요.");
            return;
        }
        
        // 파일 크기 체크 (5MB 제한)
        if (file.size > 5 * 1024 * 1024) {
            alert("이미지 크기는 5MB 이하여야 합니다.");
            return;
        }
        
        // 파일 형식 체크
        if (!file.type.startsWith('image/')) {
            alert("이미지 파일만 업로드 가능합니다.");
            return;
        }
        
        // 버튼 비활성화
        btnSubmit.disabled = true;
        btnSubmit.textContent = '추가 중...';

        // Base64로 변환
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const response = await fetch(`${API_URL}/api/characters`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name,
                        img: e.target.result
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('캐릭터 추가 완료:', result);
                    
                    await loadCharacters();
                    modal.classList.remove("active");
                    
                    alert(`'${name}' 캐릭터가 추가되었습니다!`);
                } else {
                    const error = await response.json();
                    throw new Error(error.message || '추가 실패');
                }
            } catch (error) {
                console.error('추가 실패:', error);
                alert('캐릭터 추가에 실패했습니다: ' + error.message);
            } finally {
                // 버튼 복구
                btnSubmit.disabled = false;
                btnSubmit.textContent = '추가하기';
            }
        };
        
        reader.onerror = function() {
            alert('이미지 파일을 읽는데 실패했습니다.');
            btnSubmit.disabled = false;
            btnSubmit.textContent = '추가하기';
        };
        
        reader.readAsDataURL(file);
    });
}

// 엔터키로 비밀번호 제출
if (masterInput) {
    masterInput.addEventListener("keypress", (e) => {
        if (e.key === 'Enter') {
            masterSubmit.click();
        }
    });
}

// 모달 배경 클릭시 닫기
[modal, masterModal].forEach(m => {
    if (m) {
        m.addEventListener("click", (e) => {
            if (e.target === m) {
                m.classList.remove("active");
            }
        });
    }
});

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    updateUIBasedOnAuth();
    loadCharacters();
});

// 페이지 로드 시 즉시 실행 (DOMContentLoaded 전이라도)
updateUIBasedOnAuth();
loadCharacters();
