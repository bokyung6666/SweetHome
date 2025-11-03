// main.js - 전역 배경 효과 (물방울 애니메이션)

document.addEventListener("DOMContentLoaded", () => {
  // 물방울 생성
  createBubbles();
  
  console.log("🐸 Froggy's Home 로드 완료!");
});

// 물방울 애니메이션 생성
function createBubbles() {
  const totalBubbles = 25;
  const body = document.body;

  for (let i = 0; i < totalBubbles; i++) {
    const bubble = document.createElement("div");
    bubble.classList.add("bubble");

    // 랜덤 크기 (10~40px)
    const size = Math.random() * 30 + 10;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;

    // 랜덤 위치
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.bottom = `${Math.random() * 20}px`;

    // 랜덤 애니메이션 딜레이 & 지속시간
    const delay = Math.random() * 10;
    const duration = 8 + Math.random() * 8;
    bubble.style.animationDelay = `${delay}s`;
    bubble.style.animationDuration = `${duration}s`;

    body.appendChild(bubble);
  }
}

// 전역 마스터 권한 체크 함수
function checkMasterAuth() {
  return sessionStorage.getItem("isMaster") === "true";
}

// 마스터 로그아웃 함수
function logoutMaster() {
  sessionStorage.removeItem("isMaster");
  alert("로그아웃되었습니다.");
  window.location.href = "index.html";
}

// 전역 함수로 노출
window.checkMasterAuth = checkMasterAuth;
window.logoutMaster = logoutMaster;
