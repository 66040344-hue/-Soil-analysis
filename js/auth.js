// Mock Database for Auth (using LocalStorage)
const DB_USERS = 'soil_app_users';
const DB_FIELDS = 'soil_app_fields';
const DB_STANDARDS = 'soil_app_standards';

// Ensure Default DB state exists
function initDefaultDB() {
    if (!localStorage.getItem(DB_USERS)) {
        const users = [
            {
                id: 'admin_1',
                name: 'Admin User (ผู้ดูแลระบบ)',
                phone: '0812345678',
                email: 'admin@soil.com',
                password: 'password123',
                role: 'admin',
                is_approved: true,
                created_at: new Date().toISOString()
            },
            {
                id: 'farmer_1',
                name: 'สมชาย เกษตรก้าวหน้า',
                phone: '0899999999',
                email: 'somchai@farm.com',
                password: 'password123',
                role: 'user',
                is_approved: true,
                created_at: new Date().toISOString()
            }
        ];
        localStorage.setItem(DB_USERS, JSON.stringify(users));
    }

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

    if (!localStorage.getItem(DB_STANDARDS)) {
        const defaultStandards = [
            {
                id: '1',
                fieldId: '1',
                minVal: 5.5,
                maxVal: 7.5,
                idealVal: '6.0 - 7.0 (เหมาะสมดีมาก)',
                adviceText: 'หาก pH < 5.5 ดินเป็นกรด ให้ใส่ปูนขาว 100 กก./ไร่, หาก pH > 7.5 ดินเป็นด่าง ให้ใส่ปุ๋ยอินทรีย์หรือกำมะถัน',
                crops: 'ข้าวหอมมะลิ, ข้าวโพดเลี้ยงสัตว์, อ้อยโรงงาน',
                fertilizers: 'สูตร 15-15-15 (50 กก./ไร่) ร่วมกับปุ๋ยหมักอินทรีย์'
            },
            {
                id: '2',
                fieldId: '2',
                minVal: 40,
                maxVal: 70,
                idealVal: '50% - 60%',
                adviceText: 'หากความชื้นต่ำกว่า 40% ควรให้น้ำเพิ่มด้วยระบบมินิสปริงเกลอร์ หรือคลุมดินด้วยฟางข้าว',
                crops: 'พืชผักสวนครัว, ไม้ผล, มันสำปะหลัง',
                fertilizers: 'ปุ๋ยคอกและวัสดุอุ้มน้ำ'
            }
        ];
        localStorage.setItem(DB_STANDARDS, JSON.stringify(defaultStandards));
    }
}

initDefaultDB();

function getUsers() {
    return JSON.parse(localStorage.getItem(DB_USERS)) || [];
}

function saveUsers(users) {
    localStorage.setItem(DB_USERS, JSON.stringify(users));
}

// UI Elements
const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');
const waitingView = document.getElementById('waiting-view');

const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const logoutWaitingBtn = document.getElementById('logout-waiting-btn');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// View Switching
function switchView(viewId) {
    [loginView, registerView, waitingView].forEach(view => {
        if (!view) return;
        view.classList.add('hidden');
        view.classList.remove('animate-fade-in');
    });

    const activeView = document.getElementById(viewId);
    if (activeView) {
        activeView.classList.remove('hidden');
        void activeView.offsetWidth;
        activeView.classList.add('animate-fade-in');
    }
}

if (showRegisterBtn) {
    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('register-view');
    });
}

if (showLoginBtn) {
    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchView('login-view');
    });
}

if (logoutWaitingBtn) {
    logoutWaitingBtn.addEventListener('click', () => {
        localStorage.removeItem('current_user');
        switchView('login-view');
    });
}

// Quick Demo Login Handlers removed

// Registration Logic
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const phone = document.getElementById('reg-phone').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;

        if (password !== confirmPassword) {
            alert('รหัสผ่านไม่ตรงกัน');
            return;
        }

        const users = getUsers();

        if (users.find(u => u.phone === phone)) {
            alert('เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว');
            return;
        }

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            phone,
            password,
            role: 'user',
            is_approved: false, // Waiting for admin approval
            created_at: new Date().toISOString()
        };

        users.push(newUser);
        saveUsers(users);

        localStorage.setItem('current_user', JSON.stringify(newUser));
        switchView('waiting-view');
        registerForm.reset();
    });
}

// Login Logic
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const phone = document.getElementById('login-phone').value;
        const password = document.getElementById('login-password').value;

        const users = getUsers();
        const user = users.find(u => u.phone === phone && u.password === password);

        if (!user) {
            alert('เบอร์โทรศัพท์หรือรหัสผ่านไม่ถูกต้อง');
            return;
        }

        localStorage.setItem('current_user', JSON.stringify(user));

        if (user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            if (user.is_approved) {
                window.location.href = 'dashboard.html';
            } else {
                switchView('waiting-view');
            }
        }
    });
}
