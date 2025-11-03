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
const adminControls = document.getElementById("admin-controls");

let isMaster = sessionStorage.getItem('isMaster') === 'true';
let characters = [];

// 마스터 권한 확인 (페이지 로드 시 즉시 반영)
if (isMaster) {
    adminControls.classList.remove("hidden");
    console.log("✅ 마스터 모드 활성화");
} else {
    console.log("🔒 일반 사용자 모드");
}

// 캐릭터 불러오기
async function loadCharacters() {
    try {
        const response = await fetch(`${API_URL}/api/characters`);
        characters = await response.json();
        renderCards();
    } catch (error) {
        console.error('캐릭터 로드 실패:', error);
        // 폴백: 기본 캐릭터 표시
        characters = [
            { id: 1, name: "초록개구리", img: "assets/char1.png" },
            { id: 2, name: "푸른용", img: "assets/char2.png" },
            { id: 3, name: "붉은라지", img: "assets/char3.png" }
        ];
        renderCards();
    }
}

// 캐릭터 카드 렌더링
function renderCards() {
    characterContainerEl.innerHTML = "";
    
    if (characters.length === 0) {
        characterContainerEl.innerHTML = "<p style='text-align:center;'>등록된 캐릭터가 없습니다.</p>";
        return;
    }

    characters.forEach((char) => {
        const card = document.createElement("div");
        card.className = "my-character-card";
        card.innerHTML = `
            <img src="${char.img}" alt="${char.name}">
            <a href="#">${char.name}</a>
            ${isMaster ? `<button class="delete-btn" data-id="${char.id}" style="margin-top:5px; background:red; color:white; border:none; border-radius:5px; padding:5px 10px; cursor:pointer;">삭제</button>` : ""}
        `;
        characterContainerEl.appendChild(card);
    });

    // 삭제 버튼 이벤트
    if (isMaster) {
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.target.dataset.id;
                if (!confirm('정말 삭제하시겠습니까?')) return;
                
                try {
                    await fetch(`${API_URL}/api/characters/${id}`, {
                        method: 'DELETE'
                    });
                    await loadCharacters();
                } catch (error) {
                    console.error('삭제 실패:', error);
                    alert('삭제에 실패했습니다.');
                }
            });
        });
    }
}

// 마스터 인증
masterSubmit.addEventListener("click", async () => {
    const password = masterInput.value;
    
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
            adminControls.classList.remove("hidden");
            masterModal.classList.remove("active");
            renderCards();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('인증 실패:', error);
        alert('인증에 실패했습니다.');
    }
});

// 캐릭터 추가 모달 열기
document.getElementById("add-character-btn").addEventListener("click", () => {
    if (!isMaster) {
        masterModal.classList.add("active");
        return;
    }
    modal.classList.add("active");
    inputName.value = "";
    inputImg.value = "";
});

// 모달 닫기
btnCancel.addEventListener("click", () => modal.classList.remove("active"));

// 캐릭터 추가
btnSubmit.addEventListener("click", async () => {
    const name = inputName.value.trim();
    const file = inputImg.files[0];
    
    if (!name || !file) {
        alert("이름과 이미지를 모두 입력해주세요.");
        return;
    }

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
                await loadCharacters();
                modal.classList.remove("active");
            } else {
                alert('캐릭터 추가에 실패했습니다.');
            }
        } catch (error) {
            console.error('추가 실패:', error);
            alert('캐릭터 추가에 실패했습니다.');
        }
    };
    reader.readAsDataURL(file);
});

// 초기 로드
loadCharacters();
