// commission-apply.js 안에 추가
const urlParams = new URLSearchParams(window.location.search);
const typeInput = document.getElementById('type');
if (urlParams.has('type')) {
    typeInput.value = urlParams.get('type');
} else {
    typeInput.value = "기본 일러스트"; // 기본값
}
