// sale.js - 최종 코드

const salesListEl = document.getElementById('sales-list');
const adminControls = document.getElementById('admin-controls');

let isMaster = sessionStorage.getItem('isMaster') === 'true';
let salesCharacters = JSON.parse(localStorage.getItem('salesCharacters')) || [];

// 마스터 권한 확인
if (isMaster) {
    adminControls?.classList.remove('hidden');
}

// 판매 캐릭터 렌더링
function renderSales() {
    salesListEl.innerHTML = '';
    
    if (salesCharacters.length === 0) {
        salesListEl.innerHTML = '<p style="text-align:center; padding:2rem;">현재 판매 중인 캐릭터가 없습니다.</p>';
        return;
    }

    salesCharacters.forEach((char, index) => {
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
            ${isMaster ? `<button class="delete-sale-btn" data-index="${index}" style="display:block; width:100%; margin-top:0.5rem; padding:0.5rem; background:#e57373; color:white; border:none; border-radius:8px; cursor:pointer;">삭제</button>` : ''}
        `;
        
        salesListEl.appendChild(card);
    });

    // 삭제 버튼 이벤트
    if (isMaster) {
        document.querySelectorAll('.delete-sale-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                if (!confirm('정말 삭제하시겠습니까?')) return;
                
                salesCharacters.splice(index, 1);
                localStorage.setItem('salesCharacters', JSON.stringify(salesCharacters));
                renderSales();
            });
        });
    }
}

// 캐릭터 추가
const addBtn = document.getElementById('add-character-btn');
if (addBtn) {
    addBtn.addEventListener('click', () => {
        if (!isMaster) {
            window.location.href = 'login.html';
            return;
        }
        
        const name = prompt('캐릭터 이름:');
        if (!name) return;
        
        const price = prompt('가격:');
        if (!price) return;
        
        const link = prompt('구매 링크 (선택):') || '';
        
        const imgInput = document.createElement('input');
        imgInput.type = 'file';
        imgInput.accept = 'image/*';
        
        imgInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (ev) => {
                salesCharacters.push({
                    name,
                    price,
                    img: ev.target.result,
                    link
                });
                localStorage.setItem('salesCharacters', JSON.stringify(salesCharacters));
                renderSales();
                alert('캐릭터가 추가되었습니다!');
            };
            reader.readAsDataURL(file);
        };
        
        imgInput.click();
    });
}

// 초기 로드
renderSales();
