let allItems = [];
let currentUser = null;
let isStaff = false;

window.onload = function () {
    const savedData = localStorage.getItem('scienceListDataV3');
    if (savedData) allItems = JSON.parse(savedData);

    const savedUser = localStorage.getItem('scienceUser');
    if (savedUser) updateUserUI(savedUser);

    renderItems();
};

function toggleLoginModal() {
    document.getElementById('loginModal').classList.toggle('active');
}

function handleLogin() {
    const user = document.getElementById('usernameInput').value.trim();
    const pass = document.getElementById('passwordInput').value.trim();

    if (user && pass) { // ในที่นี้ยอมรับทุกรหัสผ่านเพื่อการทดสอบ
        localStorage.setItem('scienceUser', user);
        updateUserUI(user);
        toggleLoginModal();
        renderItems();
    } else {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    }
}

function updateUserUI(user) {
    currentUser = user;
    isStaff = user.toUpperCase().startsWith('C');

    document.getElementById('userNameStatus').innerText = user;
    document.getElementById('userIcon').innerText = user.charAt(0).toUpperCase();

    // แสดง/ซ่อน ปุ่มเพิ่มข้อมูล
    const staffBtns = document.querySelectorAll('.STAFF-ONLY');
    staffBtns.forEach(btn => isStaff ? btn.classList.remove('hidden') : btn.classList.add('hidden'));

    document.getElementById('loginForm').innerHTML = `
                <p style="margin-bottom:15px;">สถานะ: ${isStaff ? 'เจ้าหน้าที่ (Staff)' : 'ผู้ใช้งานทั่วไป'}</p>
                <button class="btn" style="width: 100%; background: #ff4444;" onclick="handleLogout()">ออกจากระบบ</button>
            `;
}

function handleLogout() {
    localStorage.removeItem('scienceUser');
    location.reload();
}

function toggleStatus(id) {
    if (!isStaff) return; // เฉพาะ Staff เท่านั้นที่กดเปลี่ยนได้
    const index = allItems.findIndex(item => item.id === id);
    if (index !== -1) {
        allItems[index].isAvailable = !allItems[index].isAvailable;
        syncData();
    }
}

function renderItems() {
    const container = document.getElementById('dataContainer');
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    container.innerHTML = '';

    const filtered = allItems.filter(item => {
        const searchStr = item.type === 'room' ? item.roomNum : item.toolType;
        return searchStr.toLowerCase().includes(keyword);
    });

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';

        const statusText = item.isAvailable ? 'ว่าง' : 'ไม่ว่าง';
        const statusClass = item.isAvailable ? 'status-available' : 'status-busy';
        const deleteHtml = isStaff ? `<div class="delete-btn" onclick="deleteItem(${item.id})">ลบ</div>` : '';

        // การคลิกเปลี่ยนสถานะจะทำได้เฉพาะ Staff
        const statusOnClick = isStaff ? `onclick="toggleStatus(${item.id})"` : '';
        const statusCursor = isStaff ? '' : 'style="cursor:default"';

        if (item.type === 'room') {
            card.innerHTML = `
                        ${deleteHtml}
                        <div class="section-title"><div class="yellow-marker"></div><div class="section-label">สถานที่: ${item.roomNum}</div></div>
                        <div class="info-grid">
                            <div><label style="font-size:12px; color:#888;">ติดต่อ</label><p>${item.roomContact || '-'}</p></div>
                            <div>
                                <label style="font-size:12px; color:#888;">สถานะ ${isStaff ? '(คลิกเพื่อเปลี่ยน)' : ''}</label><br>
                                <span class="status-badge ${statusClass}" ${statusOnClick} ${statusCursor}>${statusText}</span>
                            </div>
                        </div>`;
        } else {
            card.innerHTML = `
                        ${deleteHtml}
                        <div class="section-title"><div class="blue-marker"></div><div class="section-label">อุปกรณ์: ${item.toolType}</div></div>
                        <div class="info-grid">
                            <div><label style="font-size:12px; color:#888;">ติดต่อขอยืม</label><p>${item.toolContact || '-'}</p></div>
                            <div>
                                <label style="font-size:12px; color:#888;">สถานะ ${isStaff ? '(คลิกเพื่อเปลี่ยน)' : ''}</label><br>
                                <span class="status-badge ${statusClass}" ${statusOnClick} ${statusCursor}>${statusText}</span>
                            </div>
                        </div>`;
        }
        container.appendChild(card);
    });
    document.getElementById('emptyState').classList.toggle('hidden', filtered.length > 0);
}

// --- ฟังก์ชันพื้นฐานอื่นๆ ---
let currentEntryMode = 'room';
function switchEntryMode(mode) {
    currentEntryMode = mode;
    document.getElementById('modeRoom').classList.toggle('active', mode === 'room');
    document.getElementById('modeTool').classList.toggle('active', mode === 'tool');
    document.getElementById('roomFields').classList.toggle('hidden', mode !== 'room');
    document.getElementById('toolFields').classList.toggle('hidden', mode !== 'tool');
}

function showAddForm() {
    document.getElementById('viewSection').classList.add('hidden');
    document.getElementById('editSection').classList.remove('hidden');
}

function hideAddForm() {
    document.getElementById('viewSection').classList.remove('hidden');
    document.getElementById('editSection').classList.add('hidden');
}

function saveNewData() {
    if (!isStaff) return alert("คุณไม่มีสิทธิ์เพิ่มข้อมูล");
    let newItem = { id: Date.now(), type: currentEntryMode, isAvailable: true };
    if (currentEntryMode === 'room') {
        newItem.roomNum = document.getElementById('editRoomNum').value.trim();
        newItem.roomContact = document.getElementById('editRoomContact').value.trim();
        if (!newItem.roomNum) return alert("ใส่เลขห้องด้วยครับ");
    } else {
        newItem.toolType = document.getElementById('editToolType').value.trim();
        newItem.toolContact = document.getElementById('editToolContact').value.trim();
        if (!newItem.toolType) return alert("ระบุประเภทอุปกรณ์ด้วยครับ");
    }
    allItems.unshift(newItem);
    syncData();
    hideAddForm();
}

function deleteItem(id) {
    if (!isStaff) return;
    if (confirm('ลบข้อมูลนี้ใช่ไหม?')) {
        allItems = allItems.filter(item => item.id !== id);
        syncData();
    }
}

function syncData() {
    localStorage.setItem('scienceListDataV3', JSON.stringify(allItems));
    renderItems();
}