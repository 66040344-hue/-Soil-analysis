// Check auth with auto-fallback for direct file viewing
let currentUser = JSON.parse(localStorage.getItem('current_user'));

if (!currentUser || currentUser.role !== 'admin') {
    const DB_USERS = 'soil_app_users';
    let users = JSON.parse(localStorage.getItem(DB_USERS)) || [];
    let admin = users.find(u => u.role === 'admin');

    if (!admin) {
        admin = {
            id: 'admin_1',
            name: 'Admin User (ผู้ดูแลระบบ)',
            phone: '0812345678',
            email: 'admin@soil.com',
            password: 'password123',
            role: 'admin',
            is_approved: true,
            created_at: new Date().toISOString()
        };
        users.push(admin);
        localStorage.setItem(DB_USERS, JSON.stringify(users));
    }
    currentUser = admin;
    localStorage.setItem('current_user', JSON.stringify(admin));
}

if (document.getElementById('admin-name')) {
    document.getElementById('admin-name').textContent = currentUser.name;
}

// Theme Management System (Light / Dark Mode Toggle)
window.toggleTheme = function () {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    if (newTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }

    localStorage.setItem('soil_app_theme', newTheme);
    updateThemeIcons(newTheme);
};

function updateThemeIcons(theme) {
    document.querySelectorAll('.theme-icon').forEach(icon => {
        if (theme === 'dark') {
            icon.className = 'fas fa-sun theme-icon';
            icon.style.color = '#fbbf24';
        } else {
            icon.className = 'fas fa-moon theme-icon';
            icon.style.color = 'inherit';
        }
    });
}

function initTheme() {
    const savedTheme = localStorage.getItem('soil_app_theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    updateThemeIcons(savedTheme);
}
initTheme();

// Constants
const DB_USERS = 'soil_app_users';
const DB_FIELDS = 'soil_app_fields';
const DB_STANDARDS = 'soil_app_standards';
const DB_ADVICES = 'soil_app_advices';

// Initialize DB for fields if empty
if (!localStorage.getItem(DB_FIELDS)) {
    const defaultFields = [
        { id: '1', name: 'ค่า pH (ความเป็นกรด-ด่าง)', unit: '', type: 'number' },
        { id: '2', name: 'ความชื้นในดิน', unit: '%', type: 'number' },
        { id: '3', name: 'ไนโตรเจน (N)', unit: 'mg/kg', type: 'number' },
        { id: '4', name: 'ฟอสฟอรัส (P)', unit: 'mg/kg', type: 'number' },
        { id: '5', name: 'โพแทสเซียม (K)', unit: 'mg/kg', type: 'number' }
    ];
    localStorage.setItem(DB_FIELDS, JSON.stringify(defaultFields));
}

// Initialize DB for Standards if empty
if (!localStorage.getItem(DB_STANDARDS)) {
    const defaultStandards = [
        {
            id: '1',
            fieldId: '1',
            minVal: 5.5,
            maxVal: 7.5,
            idealVal: '6.0 - 7.0 (เหมาะสมดีมาก)',
            crops: 'ข้าวหอมมะลิ, ข้าวโพดเลี้ยงสัตว์, อ้อยโรงงาน',
            fertilizers: 'สูตร 15-15-15 (50 กก./ไร่) ร่วมกับปุ๋ยหมักอินทรีย์'
        },
        {
            id: '2',
            fieldId: '2',
            minVal: 40,
            maxVal: 70,
            idealVal: '50% - 60%',
            crops: 'พืชผักสวนครัว, ไม้ผล, มันสำปะหลัง',
            fertilizers: 'ปุ๋ยคอกและวัสดุอุ้มน้ำ'
        }
    ];
    localStorage.setItem(DB_STANDARDS, JSON.stringify(defaultStandards));
}

// Initialize DB for Advices if empty
if (!localStorage.getItem(DB_ADVICES)) {
    const defaultAdvices = [
        { id: 'adv_1', fieldId: '1', minVal: 0, maxVal: 5.49, adviceText: 'ดินเป็นกรด ให้ใส่ปูนขาว 100 กก./ไร่' },
        { id: 'adv_2', fieldId: '1', minVal: 7.51, maxVal: 14, adviceText: 'ดินเป็นด่าง ให้ใส่ปุ๋ยอินทรีย์หรือกำมะถัน' },
        { id: 'adv_3', fieldId: '2', minVal: 0, maxVal: 39.9, adviceText: 'ควรให้น้ำเพิ่มด้วยระบบมินิสปริงเกลอร์ หรือคลุมดินด้วยฟางข้าว' }
    ];
    localStorage.setItem(DB_ADVICES, JSON.stringify(defaultAdvices));
}

// Data Loaders
function getUsers() { return JSON.parse(localStorage.getItem(DB_USERS)) || []; }
function saveUsers(users) { localStorage.setItem(DB_USERS, JSON.stringify(users)); }

function getFields() { return JSON.parse(localStorage.getItem(DB_FIELDS)) || []; }
function saveFields(fields) { localStorage.setItem(DB_FIELDS, JSON.stringify(fields)); }

function getStandards() { return JSON.parse(localStorage.getItem(DB_STANDARDS)) || []; }
function saveStandards(stds) { localStorage.setItem(DB_STANDARDS, JSON.stringify(stds)); }

function getAdvices() { return JSON.parse(localStorage.getItem(DB_ADVICES)) || []; }
function saveAdvices(advices) { localStorage.setItem(DB_ADVICES, JSON.stringify(advices)); }

// Navigation Helper
function switchAdminTab(targetViewId) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(l => {
        if (l.id === `nav-${targetViewId.replace('view-', '')}`) {
            l.classList.add('active');
        } else {
            l.classList.remove('active');
        }
    });

    const views = ['view-dashboard', 'view-users', 'view-fields-standards'];
    views.forEach(vId => {
        const v = document.getElementById(vId);
        if (v) v.classList.add('hidden');
    });

    const activeView = document.getElementById(targetViewId);
    if (activeView) {
        activeView.classList.remove('hidden');
        void activeView.offsetWidth;
        activeView.classList.add('animate-fade-in');
    }

    if (targetViewId === 'view-dashboard') renderDashboard();
    if (targetViewId === 'view-users') renderUsersTable();
    if (targetViewId === 'view-fields-standards') renderFieldsStandardsTable();
}

// Attach Nav Listeners
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = e.currentTarget.id.replace('nav-', 'view-');
        switchAdminTab(targetId);
    });
});

// Logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('current_user');
        window.location.href = 'index.html';
    });
}

// Render Dashboard Stats
function renderDashboard() {
    try {
        const users = getUsers();
        const fields = getFields();

        const farmers = users.filter(u => u.role === 'user');
        const pending = farmers.filter(u => !u.is_approved);

        const elUsers = document.getElementById('stat-total-users');
        const elPending = document.getElementById('stat-pending-users');
        const elFields = document.getElementById('stat-total-fields');
        const elRecords = document.getElementById('stat-total-records');

        if (elUsers) elUsers.textContent = farmers.length;
        if (elPending) elPending.textContent = pending.length;
        if (elFields) elFields.textContent = fields.length;

        const records = JSON.parse(localStorage.getItem('soil_app_records')) || [];
        if (elRecords) elRecords.textContent = records.length > 0 ? records.length : (farmers.length * 3);

        const ctx = document.getElementById('systemChart');
        if (ctx && !window.myChart) {
            window.myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'],
                    datasets: [{
                        label: 'จำนวนการวิเคราะห์ดินในระบบ',
                        data: [14, 22, 18, 35, 29, 42],
                        borderColor: '#059669',
                        backgroundColor: 'rgba(5, 150, 105, 0.08)',
                        borderWidth: 3,
                        pointBackgroundColor: '#059669',
                        fill: true,
                        tension: 0.35
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: '#0f172a', font: { family: 'Prompt', size: 13 } }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(0,0,0,0.06)' },
                            ticks: { color: '#64748b' }
                        },
                        x: {
                            grid: { color: 'rgba(0,0,0,0.06)' },
                            ticks: { color: '#64748b' }
                        }
                    }
                }
            });
        }
    } catch (err) {
        console.error('Error rendering dashboard:', err);
    }
}

// Render Users Table
function renderUsersTable() {
    try {
        const users = getUsers().filter(u => u.role === 'user');
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding: 2rem;">ยังไม่มีผู้ใช้งานลงทะเบียนในระบบ</td></tr>';
            return;
        }

        users.forEach(user => {
            const tr = document.createElement('tr');
            const regDate = user.created_at ? new Date(user.created_at).toLocaleDateString('th-TH') : '-';

            const statusBadge = user.is_approved
                ? '<span class="badge badge-success"><i class="fas fa-check-circle"></i> อนุมัติแล้ว</span>'
                : '<span class="badge badge-warning"><i class="fas fa-clock"></i> รอการอนุมัติ</span>';

            const actionBtn = user.is_approved
                ? `<button class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; border-color: #e11d48; color: #e11d48;" onclick="toggleApproval('${user.id}')"><i class="fas fa-ban"></i> ยกเลิกสิทธิ์</button>`
                : `<button class="btn btn-emerald" style="padding: 0.35rem 0.85rem; font-size: 0.8rem;" onclick="toggleApproval('${user.id}')"><i class="fas fa-check"></i> กดอนุมัติ</button>`;

            tr.innerHTML = `
                <td style="font-weight: 600; color: #0f172a;">${user.name}</td>
                <td>${user.phone}</td>
                <td style="color: var(--text-secondary);">${user.email || '-'}</td>
                <td style="color: var(--text-muted); font-size: 0.88rem;">${regDate}</td>
                <td>${statusBadge}</td>
                <td>${actionBtn}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Error rendering users table:', err);
    }
}

// Toggle Approval
window.toggleApproval = function (userId) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
        users[userIndex].is_approved = !users[userIndex].is_approved;
        saveUsers(users);
        renderUsersTable();
        renderDashboard();
    }
};

// UNIFIED FIELDS & STANDARDS MANAGEMENT
function renderFieldsStandardsTable() {
    try {
        const fields = getFields();
        const standards = getStandards();
        const tbody = document.getElementById('fields-standards-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (fields.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted" style="padding: 2rem;">ยังไม่มีการกำหนดตัวแปรและเกณฑ์มาตรฐาน</td></tr>';
            return;
        }

        fields.forEach(field => {
            const std = standards.find(s => s.fieldId === field.id) || {
                minVal: '-', maxVal: '-', idealVal: '-', crops: '-', fertilizers: '-'
            };

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 600; color: #0f172a;">${field.name}</td>
                <td><span class="badge" style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd;">${field.unit || 'ไม่มี'}</span></td>
                <td><span class="badge badge-success">${std.minVal} - ${std.maxVal}</span></td>
                <td style="color: #0284c7; font-weight: 500;">${std.idealVal}</td>
                <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="พืช: ${std.crops} | ปุ๋ย: ${std.fertilizers}">
                    ${std.crops !== '-' ? std.crops : 'ยังไม่ได้กำหนด'}
                </td>
                <td>
                    <div class="flex gap-2">
                        <button class="btn btn-outline" style="padding: 0.35rem 0.6rem; font-size: 0.8rem; border-color: #0284c7; color: #0284c7;" onclick="editFieldStandard('${field.id}')">
                            <i class="fas fa-edit"></i> แก้ไข
                        </button>
                        <button class="btn btn-outline" style="padding: 0.35rem 0.6rem; font-size: 0.8rem; border-color: #e11d48; color: #e11d48;" onclick="deleteFieldStandard('${field.id}')">
                            <i class="fas fa-trash-alt"></i> ลบ
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Error rendering fields & standards table:', err);
    }
}

window.deleteFieldStandard = function (fieldId) {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบตัวแปรและเกณฑ์มาตรฐานนี้?')) {
        let fields = getFields();
        fields = fields.filter(f => f.id !== fieldId);
        saveFields(fields);

        let standards = getStandards();
        standards = standards.filter(s => s.fieldId !== fieldId);
        saveStandards(standards);

        renderFieldsStandardsTable();
        renderDashboard();
    }
};

// Dynamic Advice Rows
window.addAdviceRow = function (min = '', max = '', text = '') {
    const container = document.getElementById('fs-advices-container');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'advice-row';
    row.style.cssText = 'background: #f8fafc; border-left: 3px solid #10b981; border-radius: 6px; padding: 0.85rem; position: relative; transition: all 0.2s ease;';
    row.innerHTML = `
        <button type="button" style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; transition: color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#94a3b8'" onclick="this.parentElement.remove()" title="ลบเงื่อนไขนี้">
            <i class="fas fa-times" style="font-size: 0.95rem;"></i>
        </button>
        <div class="grid grid-cols-2 gap-3 mb-2 pr-6">
            <div>
                <label style="font-size: 0.75rem; font-weight: 500; color: #475569; margin-bottom: 2px; display: block;">ตั้งแต่ค่า (Min)</label>
                <input type="number" step="any" class="form-control adv-min-input" placeholder="เช่น 0" value="${min}" required style="padding: 0.4rem 0.6rem; font-size: 0.85rem; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px;">
            </div>
            <div>
                <label style="font-size: 0.75rem; font-weight: 500; color: #475569; margin-bottom: 2px; display: block;">ถึงค่า (Max)</label>
                <input type="number" step="any" class="form-control adv-max-input" placeholder="เช่น 5.4" value="${max}" required style="padding: 0.4rem 0.6rem; font-size: 0.85rem; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px;">
            </div>
        </div>
        <div>
            <label style="font-size: 0.75rem; font-weight: 500; color: #475569; margin-bottom: 2px; display: block;">คำแนะนำสำหรับช่วงนี้</label>
            <input type="text" class="form-control adv-text-input" placeholder="เช่น ดินเป็นกรด ให้ใส่ปูนขาว 100 กก./ไร่" value="${text}" required style="padding: 0.4rem 0.6rem; font-size: 0.85rem; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px;">
        </div>
    `;
    container.appendChild(row);
};

window.renderAdviceRows = function (fieldId) {
    const container = document.getElementById('fs-advices-container');
    if (container) container.innerHTML = '';

    if (fieldId) {
        const advices = getAdvices().filter(a => a.fieldId === fieldId);
        advices.forEach(adv => {
            window.addAdviceRow(adv.minVal, adv.maxVal, adv.adviceText);
        });
    } else {
        // default empty row
        window.addAdviceRow();
    }
};

window.showFieldStandardModal = function () {
    const title = document.getElementById('modal-fs-title');
    const form = document.getElementById('form-field-standard');

    if (title) title.innerHTML = '<i class="fas fa-sliders"></i> เพิ่มตัวแปรและเกณฑ์มาตรฐาน';
    if (form) {
        form.reset();
        document.getElementById('fs-field-id').value = '';
    }

    window.renderAdviceRows(null);

    const modal = document.getElementById('modal-field-standard');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
};

window.editFieldStandard = function (fieldId) {
    const fields = getFields();
    const standards = getStandards();

    const field = fields.find(f => f.id === fieldId);
    if (!field) return;

    const std = standards.find(s => s.fieldId === fieldId) || {
        minVal: '', maxVal: '', idealVal: '', crops: '', fertilizers: ''
    };

    const title = document.getElementById('modal-fs-title');
    if (title) title.innerHTML = '<i class="fas fa-edit"></i> แก้ไขตัวแปรและเกณฑ์มาตรฐาน';

    document.getElementById('fs-field-id').value = field.id;
    document.getElementById('fs-name').value = field.name;
    document.getElementById('fs-unit').value = field.unit;

    document.getElementById('fs-min').value = std.minVal;
    document.getElementById('fs-max').value = std.maxVal;
    document.getElementById('fs-ideal').value = std.idealVal;
    document.getElementById('fs-crops').value = std.crops;
    document.getElementById('fs-fertilizers').value = std.fertilizers;

    window.renderAdviceRows(fieldId);

    const modal = document.getElementById('modal-field-standard');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
};

window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
};

const formFieldStandard = document.getElementById('form-field-standard');
if (formFieldStandard) {
    formFieldStandard.addEventListener('submit', (e) => {
        e.preventDefault();

        const fieldIdInput = document.getElementById('fs-field-id').value;
        const isNew = !fieldIdInput;
        const newFieldId = isNew ? Date.now().toString() : fieldIdInput;

        // Field Data
        const name = document.getElementById('fs-name').value;
        const unit = document.getElementById('fs-unit').value;

        let fields = getFields();
        if (isNew) {
            fields.push({ id: newFieldId, name, unit, type: 'number' });
        } else {
            const fIndex = fields.findIndex(f => f.id === newFieldId);
            if (fIndex !== -1) {
                fields[fIndex].name = name;
                fields[fIndex].unit = unit;
            }
        }
        saveFields(fields);

        // Standard Data
        const minVal = parseFloat(document.getElementById('fs-min').value);
        const maxVal = parseFloat(document.getElementById('fs-max').value);
        const idealVal = document.getElementById('fs-ideal').value;
        const crops = document.getElementById('fs-crops').value;
        const fertilizers = document.getElementById('fs-fertilizers').value;

        let standards = getStandards();
        const stdIndex = standards.findIndex(s => s.fieldId === newFieldId);

        if (stdIndex !== -1) {
            standards[stdIndex] = { ...standards[stdIndex], minVal, maxVal, idealVal, crops, fertilizers };
        } else {
            standards.push({
                id: Date.now().toString() + '_std',
                fieldId: newFieldId,
                minVal, maxVal, idealVal, crops, fertilizers
            });
        }
        saveStandards(standards);

        // Advices Data
        let advices = getAdvices();
        advices = advices.filter(a => a.fieldId !== newFieldId); // Clear old ones

        const adviceRows = document.querySelectorAll('.advice-row');
        adviceRows.forEach((row, idx) => {
            const advMin = parseFloat(row.querySelector('.adv-min-input').value);
            const advMax = parseFloat(row.querySelector('.adv-max-input').value);
            const advText = row.querySelector('.adv-text-input').value;

            if (!isNaN(advMin) && !isNaN(advMax) && advText.trim() !== '') {
                advices.push({
                    id: 'adv_' + Date.now().toString() + '_' + idx,
                    fieldId: newFieldId,
                    minVal: advMin,
                    maxVal: advMax,
                    adviceText: advText
                });
            }
        });
        saveAdvices(advices);

        renderFieldsStandardsTable();
        renderDashboard();
        closeModal('modal-field-standard');
    });
}

// ================= EXPORT FUNCTIONS FOR ADMIN =================
window.exportUsersExcel = function () {
    const users = getUsers().filter(u => u.role === 'user');
    if (users.length === 0) {
        alert('ไม่มีข้อมูลสมาชิกสำหรับส่งออก');
        return;
    }

    const excelData = users.map((u, idx) => ({
        'ลำดับ': idx + 1,
        'ชื่อ-นามสกุล': u.name,
        'เบอร์โทรศัพท์': u.phone,
        'อีเมล': u.email || '-',
        'วันที่สมัคร': new Date(u.created_at).toLocaleDateString('th-TH'),
        'สถานะการอนุมัติ': u.is_approved ? 'อนุมัติแล้ว' : 'รอการอนุมัติ'
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "รายชื่อเกษตรกร");
    XLSX.writeFile(wb, `รายชื่อเกษตรกร_SmartSoil_${Date.now()}.xlsx`);
};

window.exportUsersPDF = function () {
    const users = getUsers().filter(u => u.role === 'user');
    if (users.length === 0) {
        alert('ไม่มีข้อมูลสมาชิกสำหรับส่งออก');
        return;
    }

    let rowsHtml = '';
    users.forEach((u, idx) => {
        const status = u.is_approved ? '<span style="color: #059669; font-weight: bold;">อนุมัติแล้ว</span>' : '<span style="color: #d97706; font-weight: bold;">รอการอนุมัติ</span>';
        rowsHtml += `
            <tr style="border-bottom: 1px solid #e2e8f0; font-size: 13px;">
                <td style="padding: 8px; text-align: center;">${idx + 1}</td>
                <td style="padding: 8px; font-weight: bold;">${u.name}</td>
                <td style="padding: 8px;">${u.phone}</td>
                <td style="padding: 8px;">${u.email || '-'}</td>
                <td style="padding: 8px; text-align: center;">${new Date(u.created_at).toLocaleDateString('th-TH')}</td>
                <td style="padding: 8px; text-align: center;">${status}</td>
            </tr>
        `;
    });

    const printElement = document.createElement('div');
    printElement.style.padding = '30px';
    printElement.style.fontFamily = "'Prompt', sans-serif";
    printElement.style.background = '#ffffff';

    printElement.innerHTML = `
        <div style="border: 2px solid #0284c7; padding: 20px; border-radius: 10px;">
            <div style="display: flex; justify-between; align-items: center; border-bottom: 2px solid #0284c7; padding-bottom: 10px; margin-bottom: 15px;">
                <div>
                    <h2 style="color: #0284c7; margin: 0;">Smart Soil - รายงานสรุปสมาชิกเกษตรกร</h2>
                    <p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px;">ศูนย์บริหารจัดการข้อมูลเกษตรกรผู้ใช้งานระบบ</p>
                </div>
                <div style="font-size: 12px; color: #64748b;">
                    วันที่ออกเอกสาร: ${new Date().toLocaleDateString('th-TH')}
                </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr style="background: #0284c7; color: #ffffff; font-size: 12px;">
                        <th style="padding: 8px;">#</th>
                        <th style="padding: 8px; text-align: left;">ชื่อ-นามสกุล</th>
                        <th style="padding: 8px; text-align: left;">เบอร์โทรศัพท์</th>
                        <th style="padding: 8px; text-align: left;">อีเมล</th>
                        <th style="padding: 8px;">วันที่สมัคร</th>
                        <th style="padding: 8px;">สถานะ</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        </div>
    `;

    const opt = {
        margin: 10,
        filename: `รายงานสมาชิกเกษตรกร_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(printElement).save();
};

window.exportStandardsExcel = function () {
    const fields = getFields();
    const standards = getStandards();
    const advices = getAdvices();

    const excelData = fields.map((f, idx) => {
        const std = standards.find(s => s.fieldId === f.id) || {};
        const advList = advices.filter(a => a.fieldId === f.id).map(a => `[${a.minVal}-${a.maxVal}: ${a.adviceText}]`).join(' | ');

        return {
            'ลำดับ': idx + 1,
            'ตัวแปรดิน': f.name,
            'หน่วยวัด': f.unit || '-',
            'เกณฑ์ปกติ (Min-Max)': `${std.minVal || 0} - ${std.maxVal || 0}`,
            'ค่าเหมาะสมที่สุด': std.idealVal || '-',
            'พืชที่แนะนำ': std.crops || '-',
            'ปุ๋ยที่แนะนำ': std.fertilizers || '-',
            'เงื่อนไขคำแนะนำปรับปรุงดิน': advList || '-'
        };
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "เกณฑ์มาตรฐานดิน");
    XLSX.writeFile(wb, `เกณฑ์มาตรฐานวิเคราะห์ดิน_${Date.now()}.xlsx`);
};

window.exportStandardsPDF = function () {
    const fields = getFields();
    const standards = getStandards();

    let rowsHtml = '';
    fields.forEach((f, idx) => {
        const std = standards.find(s => s.fieldId === f.id) || {};
        rowsHtml += `
            <tr style="border-bottom: 1px solid #e2e8f0; font-size: 12px;">
                <td style="padding: 8px; text-align: center;">${idx + 1}</td>
                <td style="padding: 8px; font-weight: bold; color: #059669;">${f.name} ${f.unit ? `(${f.unit})` : ''}</td>
                <td style="padding: 8px; text-align: center;">${std.minVal || 0} - ${std.maxVal || 0}</td>
                <td style="padding: 8px;">${std.idealVal || '-'}</td>
                <td style="padding: 8px;">${std.crops || '-'}</td>
                <td style="padding: 8px;">${std.fertilizers || '-'}</td>
            </tr>
        `;
    });

    const printElement = document.createElement('div');
    printElement.style.padding = '30px';
    printElement.style.fontFamily = "'Prompt', sans-serif";
    printElement.style.background = '#ffffff';

    printElement.innerHTML = `
        <div style="border: 2px solid #059669; padding: 20px; border-radius: 10px;">
            <div style="display: flex; justify-between; align-items: center; border-bottom: 2px solid #059669; padding-bottom: 10px; margin-bottom: 15px;">
                <div>
                    <h2 style="color: #059669; margin: 0;">Smart Soil - รายงานตารางเกณฑ์มาตรฐานดินทางการ</h2>
                    <p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px;">เกณฑ์อ้างอิงวิเคราะห์ดิน พืชแนะนำ และแผนปุ๋ย</p>
                </div>
                <div style="font-size: 12px; color: #64748b;">
                    วันที่ออกเอกสาร: ${new Date().toLocaleDateString('th-TH')}
                </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr style="background: #059669; color: #ffffff; font-size: 12px;">
                        <th style="padding: 8px;">#</th>
                        <th style="padding: 8px; text-align: left;">ตัวแปรดิน</th>
                        <th style="padding: 8px; text-align: center;">ช่วงปกติ</th>
                        <th style="padding: 8px; text-align: left;">ค่าที่เหมาะสม</th>
                        <th style="padding: 8px; text-align: left;">พืชแนะนำ</th>
                        <th style="padding: 8px; text-align: left;">ปุ๋ยแนะนำ</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        </div>
    `;

    const opt = {
        margin: 10,
        filename: `ตารางเกณฑ์มาตรฐานดิน_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(printElement).save();
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
    renderUsersTable();
    renderFieldsStandardsTable();
});
