// sale.html에서 사용할 API 연동 스크립트

const API_URL = window.location.origin;
const salesListEl = document.getElementById('sales-list');
const adminControls = document.getElementById('admin-controls');

let isMaster = sessionStorage.getItem('isMaster') === 'true';
let salesCharacters = [];

// 마스터 권한 확인 (페이지 로드 시 즉시 반영)
if (isMaster) {
    adminControls.classList.remove('hidden');
    console.log("✅ 마스터 모드 활성화 (판매 페이지)");
} else {
    console.log("🔒 일반 사용자 모드 (판매 페이지)");
}

// 판매 캐릭터 불러오기
async function loadSales() {
    try {
        const response = await fetch(`${API_URL}/api/sales`);
        salesCharacters = await response.json();
        renderSales();
    } catch (error) {
        console.error('판매 캐릭터 로드 실패:', error);
        salesCharacters = [];
        renderSales();
    }
}

// 판매 캐릭터 렌더링
function renderSales() {
    salesListEl.innerHTML = '';
    
    if (salesCharacters.length === 0) {
        salesListEl.innerHTML = '<p style="text-align:center; padding:2rem;">현재 판매 중인 캐릭터가 없습니다.</p>';
        return;
    }

    salesCharacters.forEach(char => {
        const card = document.createElement('div');
        card.className = 'sale-card';
        card.style.cssText = `
            background: rgba(255,255,255,0.45);
            border-radius: 16px;
            padding: 1rem;
            text-align: center;
            box-shadow: 0 3px 8px rgba(0,0,0,0.1);
            transition: 0.3s;
        `;
        
        card.innerHTML = `
            <img src="${char.img}" alt="${char.name}" style="width:100%; border-radius:12px; margin-bottom:0.5rem;">
            <h3 style="margin:0.5rem 0;">${char.name}</h3>
            <p style="font-size:1.2rem; color:#2e7d32; font-weight:600;">${char.price}</p>
            ${char.link ? `<a href="${char.link}" target="_blank" style="display:inline-block; margin-top:0.5rem; padding:0.5rem 1rem; background:#8BC34A; color:white; text-decoration:none; border-radius:8px;">구매하기</a>` : ''}
            ${isMaster ? `<button class="delete-sale-btn" data-id="${char.id}" style="display:block; width:100%; margin-top:0.5rem; padding:0.5rem; background:#e57373; color:white; border:none; border-radius:8px; cursor:pointer;">삭제</button>` : ''}
        `;
        
        salesListEl.appendChild(card);
    });

    // 삭제 버튼 이벤트
    if (isMaster) {
        document.querySelectorAll('.delete-sale-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                if (!confirm('정말 삭제하시겠습니까?')) return;
                
                try {
                    await fetch(`${API_URL}/api/sales/${id}`, {
                        method: 'DELETE'
                    });
                    await loadSales();
                } catch (error) {
                    console.error('삭제 실패:', error);
                    alert('삭제에 실패했습니다.');
                }
            });
        });
    }
}

// 캐릭터 추가 버튼
if (document.getElementById('add-character-btn')) {
    document.getElementById('add-character-btn').addEventListener('click', () => {
        if (!isMaster) {
            // 마스터 인증 페이지로 이동
            window.location.href = 'login.html';
            return;
        }
        
        // 간단한 프롬프트로 추가 (나중에 모달로 개선 가능)
        const name = prompt('캐릭터 이름:');
        if (!name) return;
        
        const price = prompt('가격:');
        if (!price) return;
        
        const link = prompt('구매 링크 (선택):') || '';
        
        const imgInput = document.createElement('input');
        imgInput.type = 'file';
        imgInput.accept = 'image/*';
        
        imgInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = async (ev) => {
                try {
                    const response = await fetch(`${API_URL}/api/sales`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name,
                            price,
                            img: ev.target.result,
                            link
                        })
                    });
                    
                    if (response.ok) {
                        await loadSales();
                        alert('캐릭터가 추가되었습니다!');
                    } else {
                        alert('추가에 실패했습니다.');
                    }
                } catch (error) {
                    console.error('추가 실패:', error);
                    alert('추가에 실패했습니다.');
                }
            };
            reader.readAsDataURL(file);
        };
        
        imgInput.click();
    });
}

// 초기 로드
loadSales();