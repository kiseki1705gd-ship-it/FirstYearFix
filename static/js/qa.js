let currentUser = null;
let isStaff = false;
let currentEditingId = null;

// ข้อมูลเริ่มต้น
let faqs = JSON.parse(localStorage.getItem('scienceFaqs')) || [
    { id: 1, q: "คณะวิทยาศาสตร์ตั้งอยู่ที่ไหน?", a: "เลขที่ 123 ถนนวิทยุ แขวงลุมพินี เขตปทุมวัน กรุงเทพฯ", isPopular: true, status: 'published' },
    { id: 2, q: "ติดต่อขอรับทุนการศึกษาได้ที่ไหน?", a: "สามารถติดต่อได้ที่ฝ่ายกิจการนักศึกษา ชั้น 1 ตึก A", isPopular: false, status: 'published' }
];

window.onload = () => {
    const saved = localStorage.getItem('scienceUser');
    if (saved) updateAuth(saved);
    renderFAQs();
};

function toggleModal(id) { document.getElementById(id).classList.toggle('active'); }

function showPage(id) {
    ['viewPage', 'newQuestionsPage', 'editPage'].forEach(p => document.getElementById(p).classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    renderFAQs();
    if (id === 'newQuestionsPage') renderPending();
}

function handleLogin() {
    const u = document.getElementById('uInput').value.trim();
    if (!u) return alert("กรุณาใส่ชื่อผู้ใช้");
    localStorage.setItem('scienceUser', u);
    updateAuth(u);
    toggleModal('loginModal');
}

function handleLogout() {
    localStorage.removeItem('scienceUser');
    location.reload();
}

function updateAuth(user) {
    currentUser = user;
    isStaff = user.toUpperCase().startsWith('C');
    document.getElementById('userNameStatus').innerText = user;
    document.getElementById('userIcon').innerText = user[0].toUpperCase();
    document.querySelectorAll('.STAFF-ONLY').forEach(el => isStaff ? el.classList.remove('hidden') : el.classList.add('hidden'));
    document.querySelectorAll('.USER-ONLY').forEach(el => currentUser ? el.classList.remove('hidden') : el.classList.add('hidden'));
    document.getElementById('loginFields').classList.add('hidden');
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('userRoleText').innerText = `ผู้ใช้งาน: ${user} (${isStaff ? 'เจ้าหน้าที่' : 'ทั่วไป'})`;
    renderFAQs();
}

function submitQuestion() {
    const q = document.getElementById('askQ').value.trim();
    if (!q) return alert("ระบุคำถาม");
    faqs.push({ id: Date.now(), q: q, detail: document.getElementById('askDetail').value, a: '', isPopular: false, status: 'pending' });
    saveData();
    alert("ส่งคำถามไปให้เจ้าหน้าที่แล้ว");
    showPage('viewPage');
}

function togglePopular(id) {
    const index = faqs.findIndex(f => f.id === id);
    if (index !== -1) {
        faqs[index].isPopular = !faqs[index].isPopular;
        saveData();
        renderFAQs();
    }
}

function deleteFaq(id) {
    if (!confirm('ยืนยันการลบคำถามนี้?')) return;
    faqs = faqs.filter(f => f.id !== id);
    saveData();
    renderFAQs();
}

function openAnswerModal(id) {
    const faq = faqs.find(f => f.id === id);
    currentEditingId = id;
    document.getElementById('pendingQText').innerText = "คำถาม: " + faq.q;
    toggleModal('answerModal');
}

function publishAnswer() {
    const ans = document.getElementById('staffAnswerText').value.trim();
    const isPop = document.getElementById('makePopCheckbox').checked;
    if (!ans) return alert("กรุณาใส่คำตอบ");

    const index = faqs.findIndex(f => f.id === currentEditingId);
    faqs[index].a = ans;
    faqs[index].isPopular = isPop;
    faqs[index].status = 'published';

    saveData();
    toggleModal('answerModal');
    showPage('viewPage');
}

function renderFAQs() {
    const mainCont = document.getElementById('mainFaqContainer');
    if (!mainCont) return;
    mainCont.innerHTML = '';

    const published = faqs.filter(f => f.status === 'published')
        .sort((a, b) => b.isPopular - a.isPopular);

    published.forEach(f => {
        const adminButtons = isStaff ? `
                    <div class="staff-actions">
                        <button class="btn ${f.isPopular ? 'btn-ghost' : 'btn-secondary'}" onclick="event.stopPropagation(); togglePopular(${f.id})">
                            ${f.isPopular ? 'ยกเลิกยอดนิยม' : '⭐ ตั้งเป็นยอดนิยม'}
                        </button>
                        <button class="btn btn-danger" onclick="event.stopPropagation(); deleteFaq(${f.id})">ลบ</button>
                    </div>` : '';

        mainCont.innerHTML += `
                    <div class="faq-item">
                        <div class="question-header" onclick="this.parentElement.classList.toggle('active')">
                            <div class="${f.isPopular ? 'blue-marker' : 'yellow-marker'}"></div>
                            <div class="question-text">
                                ${f.q} 
                                ${f.isPopular ? '<span class="badge badge-pop">POPULAR</span>' : ''}
                            </div>
                            <div style="font-size:12px; color:#999">▼</div>
                        </div>
                        <div class="answer-box">
                            <div class="answer-content">
                                ${f.a}
                                ${adminButtons}
                            </div>
                        </div>
                    </div>`;
    });
}

function renderPending() {
    const pendCont = document.getElementById('pendingContainer');
    pendCont.innerHTML = '';
    const pending = faqs.filter(f => f.status === 'pending');

    if (pending.length === 0) {
        pendCont.innerHTML = '<p style="text-align:center; color:#999">ไม่มีคำถามใหม่</p>';
        return;
    }

    pending.forEach(f => {
        pendCont.innerHTML += `
                    <div style="padding:15px; border-bottom:1px solid #eee">
                        <p style="font-weight:600; color:#002266">${f.q}</p>
                        <p style="font-size:13px; color:#666; margin:5px 0">${f.detail || 'ไม่มีรายละเอียด'}</p>
                        <button class="btn btn-main" style="margin-top:10px" onclick="openAnswerModal(${f.id})">ตอบคำถาม</button>
                    </div>`;
    });
}

function saveData() {
    localStorage.setItem('scienceFaqs', JSON.stringify(faqs));
}