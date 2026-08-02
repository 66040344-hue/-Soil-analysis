// Check auth with auto-fallback for direct file viewing
let currentUser = JSON.parse(localStorage.getItem('current_user'));

if (!currentUser || currentUser.role !== 'user' || !currentUser.is_approved) {
    const DB_USERS = 'soil_app_users';
    let users = JSON.parse(localStorage.getItem(DB_USERS)) || [];
    let farmer = users.find(u => u.role === 'user' && u.is_approved);

    if (!farmer) {
        farmer = {
            id: 'farmer_1',
            name: 'สมชาย เกษตรก้าวหน้า',
            phone: '0899999999',
            email: 'somchai@farm.com',
            password: 'password123',
            role: 'user',
            is_approved: true,
            created_at: new Date().toISOString()
        };
        users.push(farmer);
        localStorage.setItem(DB_USERS, JSON.stringify(users));
    }
    currentUser = farmer;
    localStorage.setItem('current_user', JSON.stringify(farmer));
}

if (document.getElementById('user-name')) {
    document.getElementById('user-name').textContent = currentUser.name;
}
if (document.getElementById('mobile-user-name')) {
    document.getElementById('mobile-user-name').textContent = currentUser.name;
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
const DB_FIELDS = 'soil_app_fields';
const DB_RECORDS = 'soil_app_records';
const DB_STANDARDS = 'soil_app_standards';
const DB_ADVICES = 'soil_app_advices';

let currentAnalysisResult = null;

// View Switch Helper
function switchDashboardTab(tabId) {
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.id === `nav-${tabId}`) link.classList.add('active');
        else link.classList.remove('active');
    });

    document.querySelectorAll('.mobile-nav-item').forEach(link => {
        if (link.id === `mobile-nav-${tabId}`) link.classList.add('active');
        else link.classList.remove('active');
    });

    const analyzeView = document.getElementById('view-analyze');
    const historyView = document.getElementById('view-history');

    if (tabId === 'analyze') {
        historyView.classList.add('hidden');
        analyzeView.classList.remove('hidden');
        void analyzeView.offsetWidth;
        analyzeView.classList.add('animate-fade-in');
        if (typeof goToWizardStep === 'function' && !currentAnalysisResult) {
            goToWizardStep(1);
        }
    } else if (tabId === 'history') {
        analyzeView.classList.add('hidden');
        historyView.classList.remove('hidden');
        void historyView.offsetWidth;
        historyView.classList.add('animate-fade-in');
        renderHistory();
    }
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = e.currentTarget.id.replace('nav-', '');
        switchDashboardTab(tabId);
    });
});

document.querySelectorAll('.mobile-nav-item').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = e.currentTarget.id.replace('mobile-nav-', '');
        switchDashboardTab(tabId);
    });
});

const handleLogout = () => {
    localStorage.removeItem('current_user');
    window.location.href = 'index.html';
};

if (document.getElementById('logout-btn')) {
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
}
if (document.getElementById('mobile-logout-btn')) {
    document.getElementById('mobile-logout-btn').addEventListener('click', handleLogout);
}

// Load Dynamic Fields
function renderDynamicFields() {
    const fields = JSON.parse(localStorage.getItem(DB_FIELDS)) || [];
    const container = document.getElementById('dynamic-fields-container');
    container.innerHTML = '';

    if (fields.length === 0) {
        container.innerHTML = '<p class="text-muted">ยังไม่มีการตั้งค่าตัวแปรจากผู้ดูแลระบบ</p>';
        return;
    }

    const standards = JSON.parse(localStorage.getItem(DB_STANDARDS)) || [];

    fields.forEach(field => {
        const div = document.createElement('div');
        div.className = 'form-group';

        let label = field.name;
        if (field.unit) label += ` (${field.unit})`;
        
        const std = standards.find(s => s.fieldId === field.id);
        const stdText = std ? `<span style="float:right; font-size: 0.8rem; color: var(--text-muted); font-weight: 400;"><i class="fas fa-info-circle"></i> มาตรฐาน: ${std.minVal} - ${std.maxVal} ${field.unit || ''}</span>` : '';

        div.innerHTML = `
            <label class="form-label" style="display: block; width: 100%;">${label} ${stdText}</label>
            <input type="${field.type}" id="field-${field.id}" data-id="${field.id}" data-name="${field.name}" class="form-control dynamic-input" required placeholder="ระบุ ${field.name}">
        `;
        container.appendChild(div);
    });
}

// Wizard Navigation Controller
window.goToWizardStep = function(step) {
    // Hide all steps
    for (let i = 1; i <= 4; i++) {
        const el = document.getElementById(`wizard-step-${i}`);
        if (el) el.style.display = 'none';
    }
    
    // Show target step
    const targetEl = document.getElementById(`wizard-step-${step}`);
    if (targetEl) {
        targetEl.style.display = 'block';
        // Trigger animation
        targetEl.classList.remove('animate-fade-in');
        void targetEl.offsetWidth;
        targetEl.classList.add('animate-fade-in');
    }
    
    // Update Stepper Bar UI
    if (typeof updateStepper === 'function') {
        updateStepper(step);
    }
};

// Dynamic Analysis Engine using Admin Configured Standards
document.getElementById('form-analyze').addEventListener('submit', (e) => {
    e.preventDefault();

    // 1. Show Processing Step
    goToWizardStep(2);

    setTimeout(() => {
        const plotNameInput = document.getElementById('plot-name');
        const plotName = plotNameInput ? plotNameInput.value.trim() : 'ไม่ระบุแปลง';
        
        const inputs = document.querySelectorAll('.dynamic-input');
        const data = {};

        inputs.forEach(input => {
            data[input.getAttribute('data-id')] = {
                name: input.getAttribute('data-name'),
                value: input.value
            };
        });

        const standards = JSON.parse(localStorage.getItem(DB_STANDARDS)) || [];
        const allAdvices = JSON.parse(localStorage.getItem(DB_ADVICES)) || [];
        const advices = [];
        let isOverallGood = true;
        let recommendedCropsList = [];
        let recommendedFertilizersList = [];

        // Evaluate each field against standards & advices
        Object.keys(data).forEach(fieldId => {
            const item = data[fieldId];
            const val = parseFloat(item.value);

            const std = standards.find(s => s.fieldId === fieldId);
            const fieldAdvices = allAdvices.filter(a => a.fieldId === fieldId);

            // Find matching advice for the exact numeric range entered
            const matchedAdvice = fieldAdvices.find(a => val >= parseFloat(a.minVal) && val <= parseFloat(a.maxVal));

            if (!isNaN(val)) {
                let status = 'good';
                let adviceText = matchedAdvice ? matchedAdvice.adviceText : '';
                let statusHtml = '';

                if (std) {
                    if (val < std.minVal) {
                        isOverallGood = false;
                        status = 'low';
                        adviceText = matchedAdvice ? matchedAdvice.adviceText : 'ควรปรับปรุงสภาพดินให้อยู่ในเกณฑ์มาตรฐาน';
                        statusHtml = `<span class="badge badge-warning" style="background: rgba(244, 63, 94, 0.1); color: var(--danger-color);"><i class="fas fa-arrow-down"></i> ต่ำกว่าเกณฑ์</span>`;
                    } else if (val > std.maxVal) {
                        isOverallGood = false;
                        status = 'high';
                        adviceText = matchedAdvice ? matchedAdvice.adviceText : 'ควรปรับปรุงสภาพดินให้อยู่ในเกณฑ์มาตรฐาน';
                        statusHtml = `<span class="badge badge-warning" style="background: rgba(245, 158, 11, 0.1); color: var(--warning-color);"><i class="fas fa-arrow-up"></i> สูงกว่าเกณฑ์</span>`;
                    } else {
                        statusHtml = `<span class="badge badge-success" style="background: rgba(16, 185, 129, 0.1); color: var(--primary-color);"><i class="fas fa-check"></i> เหมาะสม</span>`;
                    }

                    if (std.crops) recommendedCropsList.push(std.crops);
                    if (std.fertilizers) recommendedFertilizersList.push(std.fertilizers);
                    
                    advices.push({
                        fieldId: fieldId,
                        fieldName: item.name,
                        val: val,
                        stdMin: std.minVal,
                        stdMax: std.maxVal,
                        unit: std.unit || '',
                        status: status,
                        statusHtml: statusHtml,
                        adviceText: adviceText
                    });
                } else {
                    advices.push({
                        fieldId: fieldId,
                        fieldName: item.name,
                        val: val,
                        stdMin: '-',
                        stdMax: '-',
                        unit: '',
                        status: 'info',
                        statusHtml: `<span class="badge" style="background: rgba(2, 132, 199, 0.1); color: var(--secondary-color);"><i class="fas fa-info"></i> ข้อมูลทั่วไป</span>`,
                        adviceText: matchedAdvice ? matchedAdvice.adviceText : ''
                    });
                }
            }
        });

        const crops = recommendedCropsList.length > 0 ? Array.from(new Set(recommendedCropsList)).join(' / ') : 'ข้าว, ข้าวโพด, อ้อย';
        const fertilizers = recommendedFertilizersList.length > 0 ? Array.from(new Set(recommendedFertilizersList)).join(' / ') : 'สูตร 15-15-15 (50 กก./ไร่)';

        currentAnalysisResult = {
            date: new Date().toISOString(),
            plotName: plotName,
            data: data,
            advices: advices,
            crops: crops,
            fertilizers: fertilizers,
            status: isOverallGood ? 'good' : 'needs_improvement'
        };

        // Render Results Table (Desktop)
        const resultTbody = document.getElementById('analysis-result-table-body');
        if (resultTbody) {
            resultTbody.innerHTML = advices.map(a => `
                <tr>
                    <td style="font-weight: 500;">${a.fieldName}</td>
                    <td style="color: var(--text-secondary);">${a.stdMin} - ${a.stdMax} ${a.unit}</td>
                    <td style="font-weight: 600; color: var(--primary-color);">${a.val} ${a.unit}</td>
                    <td>
                        <div style="margin-bottom: 0.25rem;">${a.statusHtml}</div>
                        ${a.adviceText ? `<div style="font-size: 0.8rem; color: var(--text-muted);">${a.adviceText}</div>` : ''}
                    </td>
                </tr>
            `).join('');
        }

        // Render Results Cards (Mobile)
        const mobileCardsContainer = document.getElementById('analysis-result-mobile-cards');
        if (mobileCardsContainer) {
            mobileCardsContainer.innerHTML = generateMobileCardsHtml(advices);
        }

        document.getElementById('recommended-crops').textContent = crops;
        document.getElementById('recommended-fertilizers').textContent = fertilizers;

        // Render Single Analysis Chart
        renderChart([currentAnalysisResult], 'analysis-charts-wrapper');

        // 2. Go to Recommendations Step
        goToWizardStep(3);
    }, 1200); // 1.2 seconds simulation delay
});

// Save Record
window.saveRecord = function () {
    if (!currentAnalysisResult) return;

    let records = JSON.parse(localStorage.getItem(DB_RECORDS)) || [];

    if (window.editingRecordId) {
        // Update existing record
        const index = records.findIndex(r => r.id === window.editingRecordId);
        if (index !== -1) {
            records[index] = {
                ...records[index],
                ...currentAnalysisResult,
                // Keep original ID and date, or update date? Usually better to update date to reflect edit time
                date: new Date().toISOString()
            };
        }
        window.editingRecordId = null;
    } else {
        // Create new record
        records.push({
            id: Date.now().toString(),
            userId: currentUser.id,
            ...currentAnalysisResult
        });
    }

    localStorage.setItem(DB_RECORDS, JSON.stringify(records));
    // updateStepper(4) is handled inside saveRecord when user chooses step 4
    alert('บันทึกข้อมูลผลการวิเคราะห์เรียบร้อยแล้ว!');
    currentAnalysisResult = null;
    document.getElementById('form-analyze').reset();
    
    switchDashboardTab('history');
    goToWizardStep(1);
};

// Render History Table
function renderHistory() {
    const allRecords = JSON.parse(localStorage.getItem(DB_RECORDS)) || [];
    const userRecords = allRecords.filter(r => r.userId === currentUser.id).sort((a, b) => new Date(a.date) - new Date(b.date));

    const tbody = document.getElementById('history-table-body');
    tbody.innerHTML = '';

    if (userRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted" style="padding: 2rem;">ยังไม่มีประวัติการวิเคราะห์ดิน</td></tr>';
        return;
    }

    [...userRecords].reverse().forEach(record => {
        const date = new Date(record.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight: 600;">${date}</td>
            <td><span class="badge" style="background: rgba(16, 185, 129, 0.1); color: var(--primary-color); border: 1px solid rgba(16,185,129,0.3);"><i class="fas fa-map-marker-alt"></i> ${record.plotName || 'ไม่ระบุ'}</span></td>
            <td style="text-align: right; display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button class="btn btn-emerald" style="padding: 0.35rem 0.75rem; font-size: 0.85rem; border-radius: var(--radius-full);" onclick="viewHistoryDetail('${record.id}')" title="ดูข้อมูล">
                    <i class="fas fa-search"></i>
                </button>
                <button class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.85rem; border-radius: var(--radius-full); border-color: #eab308; color: #eab308;" onclick="editRecord('${record.id}')" title="แก้ไข">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.85rem; border-radius: var(--radius-full); border-color: #ef4444; color: #ef4444;" onclick="deleteRecord('${record.id}')" title="ลบ">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    renderChart(userRecords);
}

// Render Scientific Threshold Benchmark Charts
function renderChart(records, wrapperId = 'history-charts-wrapper') {
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;

    wrapper.innerHTML = '';
    
    if (!window.chartInstancesCache) window.chartInstancesCache = {};
    if (window.chartInstancesCache[wrapperId] && window.chartInstancesCache[wrapperId].length > 0) {
        window.chartInstancesCache[wrapperId].forEach(chart => chart.destroy());
    }
    window.chartInstancesCache[wrapperId] = [];

    const standards = JSON.parse(localStorage.getItem(DB_STANDARDS)) || [];
    const fields = JSON.parse(localStorage.getItem(DB_FIELDS)) || [];

    // Master list of all soil variables in the system
    const targetFields = fields.length > 0 ? fields : standards.map(s => ({ id: s.fieldId, name: s.name || 'ตัวแปรดิน', unit: s.unit || '' }));

    if (targetFields.length === 0 || records.length === 0) {
        wrapper.innerHTML = '<div class="text-muted col-span-2 text-center" style="padding: 2rem;">ไม่มีข้อมูลตัวแปรดินในระบบสำหรับแสดงกราฟ</div>';
        return;
    }

    const labels = records.map(r => new Date(r.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }));

    // Create a scientific threshold chart for EVERY field in the system
    targetFields.forEach((fieldObj, index) => {
        const std = standards.find(s => s.fieldId === fieldObj.id) || {};
        const fieldName = fieldObj.name || 'ตัวแปรดิน';
        const fieldUnit = fieldObj.unit || std.unit || '';
        const minVal = !isNaN(parseFloat(std.minVal)) ? parseFloat(std.minVal) : 0;
        const maxVal = !isNaN(parseFloat(std.maxVal)) ? parseFloat(std.maxVal) : 100;

        // Extract data for this specific field across all records (by ID or Name fallback)
        const fieldData = [];
        records.forEach(r => {
            let val = null;
            if (r.data) {
                if (r.data[fieldObj.id] && r.data[fieldObj.id].value !== undefined && r.data[fieldObj.id].value !== '') {
                    val = parseFloat(r.data[fieldObj.id].value);
                } else {
                    const match = Object.values(r.data).find(d => d.name === fieldName || d.id === fieldObj.id);
                    if (match && match.value !== undefined && match.value !== '') {
                        val = parseFloat(match.value);
                    }
                }
            }
            fieldData.push(!isNaN(val) ? val : null);
        });

        // Calculate dynamic box delta for floating box effect
        const validVals = fieldData.filter(v => v !== null);
        const avgVal = validVals.length > 0 ? validVals.reduce((a, b) => a + b, 0) / validVals.length : (minVal + maxVal) / 2;
        const boxDelta = Math.max(0.12, avgVal * 0.07);

        // Floating range data [min, max]
        const floatingBoxData = fieldData.map(v => v !== null ? [v - boxDelta, v + boxDelta] : null);

        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDarkMode ? '#f8fafc' : '#030712';
        const mutedColor = isDarkMode ? '#94a3b8' : '#64748b';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';

        // Dynamic status color grading logic (Green within range, Yellow -> Orange -> Deep Red for deviations)
        const statusColors = fieldData.map(v => {
            if (v === null || isNaN(v)) return { bg: '#64748b', border: '#475569', text: '-' };

            if (v >= minVal && v <= maxVal) {
                // Within range -> GREEN
                return {
                    bg: '#10b981',
                    border: '#047857',
                    text: '✅ อยู่ในเกณฑ์เหมาะสม'
                };
            }

            const rangeSpan = Math.max(0.1, maxVal - minVal);
            const diff = v < minVal ? (minVal - v) / rangeSpan : (v - maxVal) / rangeSpan;

            if (diff <= 0.3) {
                // Mild deviation -> YELLOW / AMBER
                return {
                    bg: '#d97706',
                    border: '#b45309',
                    text: v < minVal ? '⚠️ ต่ำกว่าเกณฑ์เล็กน้อย' : '⚠️ สูงกว่าเกณฑ์เล็กน้อย'
                };
            } else if (diff <= 0.75) {
                // Moderate deviation -> ORANGE
                return {
                    bg: isDarkMode ? '#f97316' : '#ea580c',
                    border: '#c2410c',
                    text: v < minVal ? '⚠️ ต่ำกว่าเกณฑ์ปานกลาง' : '⚠️ สูงกว่าเกณฑ์ปานกลาง'
                };
            } else {
                // Severe / Extreme deviation -> DEEP RED ALMOST BLACK
                return {
                    bg: '#450a0a',
                    border: '#2a0000',
                    text: v < minVal ? '🚨 ต่ำกว่าเกณฑ์มาก' : '🚨 สูงกว่าเกณฑ์มาก'
                };
            }
        });

        const boxBgColors = statusColors.map(c => c.bg);
        const boxBorderColors = statusColors.map(c => c.border);

        // Create canvas wrapper
        const canvasWrapper = document.createElement('div');
        canvasWrapper.className = 'glass-card chart-container';
        canvasWrapper.style.height = '270px';
        canvasWrapper.style.padding = '0.85rem 0.6rem';
        
        const canvas = document.createElement('canvas');
        canvas.id = `${wrapperId}_chart_${std.fieldId || index}`;
        canvasWrapper.appendChild(canvas);
        wrapper.appendChild(canvasWrapper);

        const ctx = canvas.getContext('2d');

        // Custom Plugin to draw horizontal lines for min/max
        const horizontalLinePlugin = {
            id: 'horizontalLine',
            beforeDraw: (chart) => {
                if (chart.data.labels.length === 1) { // Only draw lines if there's just 1 data point
                    const ctx = chart.ctx;
                    const xAxis = chart.scales.x;
                    const yAxis = chart.scales.y;
                    
                    chart.data.datasets.forEach(dataset => {
                        if (dataset.type === 'line' && (dataset.label.includes('Max') || dataset.label.includes('Min'))) {
                            const yVal = dataset.data[0];
                            const yPixel = yAxis.getPixelForValue(yVal);
                            
                            ctx.save();
                            ctx.beginPath();
                            ctx.moveTo(xAxis.left, yPixel);
                            ctx.lineTo(xAxis.right, yPixel);
                            ctx.lineWidth = dataset.borderWidth || 2;
                            ctx.strokeStyle = dataset.borderColor;
                            if (dataset.borderDash) {
                                ctx.setLineDash(dataset.borderDash);
                            }
                            ctx.stroke();
                            ctx.restore();
                        }
                    });
                }
            }
        };

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        type: 'line',
                        label: `Max (${maxVal} ${fieldUnit})`,
                        data: Array(labels.length).fill(maxVal),
                        borderColor: '#15803d',
                        borderWidth: 2,
                        pointRadius: 0,
                        fill: false,
                        order: 1
                    },
                    {
                        type: 'line',
                        label: `Min (${minVal} ${fieldUnit})`,
                        data: Array(labels.length).fill(minVal),
                        borderColor: '#dc2626',
                        borderDash: [5, 4],
                        borderWidth: 2,
                        pointRadius: 0,
                        fill: false,
                        order: 2
                    },
                    {
                        type: 'line',
                        label: `ตำแหน่งค่าจริง (X)`,
                        data: fieldData,
                        showLine: false,
                        pointStyle: 'crossRot',
                        pointRadius: 6.5,
                        pointHoverRadius: 8.5,
                        pointBorderWidth: 2,
                        pointBorderColor: boxBorderColors,
                        order: 3
                    },
                    {
                        type: 'bar',
                        label: `ค่าจริง (Floating Box)`,
                        data: floatingBoxData,
                        backgroundColor: boxBgColors,
                        borderColor: boxBorderColors,
                        borderWidth: 1.8,
                        borderSkipped: false,
                        borderRadius: 5,
                        barPercentage: 0.4,
                        order: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `[ ${fieldName} ]`,
                        align: 'start',
                        font: { family: 'Prompt', size: 13, weight: '700' },
                        color: textColor,
                        padding: { bottom: 8 }
                    },
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                            usePointStyle: true,
                            boxWidth: 6,
                            padding: 6,
                            font: { family: 'Prompt', size: 10 },
                            color: textColor,
                            filter: function(item) {
                                return !item.text.includes('ตำแหน่งค่าจริง');
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const idx = context.dataIndex;
                                const val = fieldData[idx];
                                const st = statusColors[idx];
                                if (val === null) return 'ไม่มีข้อมูล';
                                return `ค่าที่ตรวจวัดได้: ${val} ${fieldUnit} (${st.text})`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: `${fieldName} ${fieldUnit ? '(' + fieldUnit + ')' : ''}`,
                            font: { family: 'Prompt', size: 11, weight: '600' },
                            color: mutedColor
                        },
                        grid: { color: gridColor },
                        ticks: { color: mutedColor, font: { size: 10 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: mutedColor, font: { size: 10 } }
                    }
                }
            },
            plugins: [horizontalLinePlugin]
        });

        window.chartInstancesCache[wrapperId].push(chart);
    });
}

// Export Analysis PDF (Official Certificate Report)
window.exportAnalysisPDF = function () {
    if (!currentAnalysisResult) {
        alert('กรุณาทำการวิเคราะห์ดินก่อนส่งออกไฟล์ PDF');
        return;
    }

    const dateStr = new Date(currentAnalysisResult.date).toLocaleDateString('th-TH', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    let itemsHtml = '';
    Object.keys(currentAnalysisResult.data).forEach(fieldId => {
        const item = currentAnalysisResult.data[fieldId];
        itemsHtml += `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold; color: #1e293b;">${item.name}</td>
                <td style="padding: 10px; text-align: center; font-size: 1.1em; color: #059669; font-weight: bold;">${item.value}</td>
            </tr>
        `;
    });

    let adviceClean = currentAnalysisResult.advices.map(a => `<li style="margin-bottom: 6px;">${a.replace(/<[^>]*>?/gm, '')}</li>`).join('');

    const printElement = document.createElement('div');
    printElement.style.padding = '30px';
    printElement.style.fontFamily = "'Prompt', sans-serif";
    printElement.style.color = '#0f172a';
    printElement.style.background = '#ffffff';

    printElement.innerHTML = `
        <div style="border: 2px solid #059669; padding: 25px; border-radius: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 15px; margin-bottom: 20px;">
                <div>
                    <h1 style="color: #059669; margin: 0; font-size: 24px; font-weight: bold;">🌱 Smart Soil - รายงานผลวิเคราะห์ดินทางการ</h1>
                    <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">ระบบวิเคราะห์สภาพดินเพื่อการเกษตรแม่นยำ</p>
                </div>
                <div style="text-align: right; font-size: 12px; color: #475569;">
                    <div><strong>วันที่ออกรายงาน:</strong> ${dateStr}</div>
                    <div><strong>เกษตรกรผู้ถือแปลง:</strong> ${currentUser.name}</div>
                    <div><strong>เบอร์โทรศัพท์:</strong> ${currentUser.phone}</div>
                </div>
            </div>

            <div style="margin-bottom: 25px;">
                <h3 style="color: #0284c7; border-left: 4px solid #0284c7; padding-left: 10px; margin-bottom: 12px; font-size: 16px;">1. ข้อมูลสภาพดินจากการตรวจวิเคราะห์</h3>
                <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border-radius: 8px; overflow: hidden;">
                    <thead>
                        <tr style="background: #e2e8f0; color: #334155; font-size: 13px;">
                            <th style="padding: 10px; text-align: left;">ตัวแปรวัดสภาพดิน</th>
                            <th style="padding: 10px; text-align: center;">ค่าที่วัดได้</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
            </div>

            <div style="margin-bottom: 25px;">
                <h3 style="color: #d97706; border-left: 4px solid #d97706; padding-left: 10px; margin-bottom: 12px; font-size: 16px;">2. สรุปคำแนะนำในการปรับปรุงคุณภาพดิน</h3>
                <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.6;">
                    ${adviceClean}
                </ul>
            </div>

            <div style="display: flex; gap: 20px; margin-bottom: 30px;">
                <div style="flex: 1; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px;">
                    <h4 style="color: #166534; margin: 0 0 6px 0; font-size: 14px;">🌾 พืชที่แนะนำให้เพาะปลูก:</h4>
                    <p style="margin: 0; color: #15803d; font-weight: bold; font-size: 15px;">${currentAnalysisResult.crops}</p>
                </div>
                <div style="flex: 1; background: #fefce8; border: 1px solid #fef08a; padding: 15px; border-radius: 8px;">
                    <h4 style="color: #854d0e; margin: 0 0 6px 0; font-size: 14px;">🧪 แผนและสูตรปุ๋ยแนะนำ:</h4>
                    <p style="margin: 0; color: #a16207; font-weight: bold; font-size: 15px;">${currentAnalysisResult.fertilizers}</p>
                </div>
            </div>

            <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #94a3b8;">
                เอกสารนี้ได้รับการประมวลผลด้วยระบบ Smart Soil | ศูนย์บริการวิเคราะห์ดินดิจิทัล
            </div>
        </div>
    `;

    const opt = {
        margin: 10,
        filename: `รายงานวิเคราะห์ดิน_${currentUser.name}_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(printElement).save();
};

// Export Analysis Excel
window.exportAnalysisExcel = function () {
    if (!currentAnalysisResult) {
        alert('กรุณาทำการวิเคราะห์ดินก่อนส่งออกไฟล์ Excel');
        return;
    }

    const excelData = [];
    Object.keys(currentAnalysisResult.data).forEach(fieldId => {
        const item = currentAnalysisResult.data[fieldId];
        excelData.push({
            'ตัวแปรดิน': item.name,
            'ค่าที่วัดได้': item.value
        });
    });

    excelData.push({});
    excelData.push({ 'ตัวแปรดิน': 'พืชที่แนะนำ', 'ค่าที่วัดได้': currentAnalysisResult.crops });
    excelData.push({ 'ตัวแปรดิน': 'สูตรปุ๋ยแนะนำ', 'ค่าที่วัดได้': currentAnalysisResult.fertilizers });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ผลวิเคราะห์ดิน");
    XLSX.writeFile(wb, `ผลวิเคราะห์ดิน_${currentUser.name}.xlsx`);
};

// Export History Excel
window.exportHistoryExcel = function () {
    const allRecords = JSON.parse(localStorage.getItem(DB_RECORDS)) || [];
    const userRecords = allRecords.filter(r => r.userId === currentUser.id);

    if (userRecords.length === 0) {
        alert('ยังไม่มีประวัติการวิเคราะห์ดินสำหรับส่งออก');
        return;
    }

    const excelData = userRecords.map((r, idx) => {
        const date = new Date(r.date).toLocaleDateString('th-TH');
        return {
            'ลำดับ': idx + 1,
            'วันที่วิเคราะห์': date,
            'สถานะดิน': r.status === 'good' ? 'เหมาะสม' : 'ต้องปรับปรุง',
            'พืชที่แนะนำ': r.crops,
            'สูตรปุ๋ยแนะนำ': r.fertilizers
        };
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ประวัติวิเคราะห์ดิน");
    XLSX.writeFile(wb, `ประวัติการวิเคราะห์ดิน_${currentUser.name}.xlsx`);
};

// Stepper Progress Bar Controller
window.updateStepper = function(stepState) {
    const item1 = document.getElementById('step-item-1');
    const item2 = document.getElementById('step-item-2');
    const item3 = document.getElementById('step-item-3');
    const item4 = document.getElementById('step-item-4');
    
    const line1 = document.getElementById('step-line-1');
    const line2 = document.getElementById('step-line-2');
    const line3 = document.getElementById('step-line-3');
    
    if (!item1) return;

    [item1, item2, item3, item4].forEach(item => {
        if (item) item.classList.remove('active', 'completed');
    });
    [line1, line2, line3].forEach(line => {
        if (line) line.classList.remove('completed');
    });

    if (stepState === 1) {
        item1.classList.add('active');
    } else if (stepState === 2) {
        item1.classList.add('completed');
        if (line1) line1.classList.add('completed');
        item2.classList.add('active');
    } else if (stepState === 3) {
        item1.classList.add('completed');
        if (line1) line1.classList.add('completed');
        item2.classList.add('completed');
        if (line2) line2.classList.add('completed');
        item3.classList.add('active');
    } else if (stepState === 4) {
        item1.classList.add('completed');
        if (line1) line1.classList.add('completed');
        item2.classList.add('completed');
        if (line2) line2.classList.add('completed');
        item3.classList.add('completed');
        if (line3) line3.classList.add('completed');
        item4.classList.add('completed');
    }
};

// View History Details in Modal
window.viewHistoryDetail = function(id) {
    const allRecords = JSON.parse(localStorage.getItem(DB_RECORDS)) || [];
    const record = allRecords.find(r => r.id === id);
    if (!record) return;

    const modalBody = document.getElementById('history-detail-body');
    const date = new Date(record.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
    const time = new Date(record.date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    let tableRows = '';
    if (record.advices && Array.isArray(record.advices) && typeof record.advices[0] === 'object') {
        tableRows = record.advices.map(a => `
            <tr>
                <td style="font-weight: 500;">${a.fieldName}</td>
                <td style="color: var(--text-secondary);">${a.stdMin} - ${a.stdMax} ${a.unit}</td>
                <td style="font-weight: 600; color: var(--primary-color);">${a.val} ${a.unit}</td>
                <td>
                    <div style="margin-bottom: 0.25rem;">${a.statusHtml}</div>
                    ${a.adviceText ? `<div style="font-size: 0.8rem; color: var(--text-muted);">${a.adviceText}</div>` : ''}
                </td>
            </tr>
        `).join('');
    } else {
        // Fallback for old data structure
        Object.keys(record.data).forEach(fieldId => {
            const item = record.data[fieldId];
            tableRows += `
                <tr>
                    <td style="font-weight: 500;">${item.name}</td>
                    <td style="color: var(--text-secondary);">-</td>
                    <td style="font-weight: 600; color: var(--primary-color);">${item.value}</td>
                    <td>-</td>
                </tr>
            `;
        });
    }

    modalBody.innerHTML = `
        <div class="mb-4" style="text-align: center;">
            <div style="font-size: 0.9rem; color: var(--text-muted);">วันที่วิเคราะห์</div>
            <div style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary);">${date} เวลา ${time} น.</div>
            <div class="mt-2">
                ${record.status === 'good' 
                    ? '<span class="badge badge-success px-3 py-1" style="font-size: 0.9rem;"><i class="fas fa-check-circle"></i> สถานะ: เหมาะสม</span>' 
                    : '<span class="badge badge-warning px-3 py-1" style="font-size: 0.9rem;"><i class="fas fa-exclamation-triangle"></i> สถานะ: ต้องปรับปรุง</span>'}
            </div>
        </div>

        <h4 class="mb-2 text-emerald"><i class="fas fa-flask"></i> ผลการประเมินสภาพดิน</h4>
        <div class="table-container desktop-only-table mb-4">
            <table>
                <thead>
                    <tr>
                        <th>ตัวแปรดิน</th>
                        <th>ค่ามาตรฐาน</th>
                        <th>ค่าที่วัดได้</th>
                        <th>ผลประเมิน</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>
        <div class="mobile-only-cards mb-4">
            ${generateMobileCardsHtml(record.advices)}
        </div>
        
        <div id="modal-charts-wrapper" class="responsive-chart-grid mb-4">
            <!-- Modal charts injected here -->
        </div>

        <h4 class="mb-2 text-emerald"><i class="fas fa-lightbulb"></i> คำแนะนำและพืชที่เหมาะสม</h4>
        <div class="glass-card" style="padding: 0.75rem 1rem;">
            <div class="mb-3">
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.25rem;">พืชที่แนะนำ:</div>
                <div style="font-weight: 600; color: var(--secondary-color);">${record.crops}</div>
            </div>
            <div class="mb-3">
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.25rem;">สูตรปุ๋ยแนะนำ:</div>
                <div style="font-weight: 600; color: var(--warning-color);">${record.fertilizers}</div>
            </div>
            <div>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">ผลประเมินรายตัว:</div>
                ${record.advices ? record.advices.map(a => `<div style="font-size: 0.85rem; margin-bottom: 0.5rem; line-height: 1.4;">${typeof a === 'object' ? a.adviceText || '-' : a}</div>`).join('') : ''}
            </div>
        </div>
    `;

    document.getElementById('modal-history-detail').classList.add('active');
    
    // Render Modal Charts
    renderChart([record], 'modal-charts-wrapper');
};

// Close Modal
window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
};

// Edit Record
window.editRecord = function(id) {
    const allRecords = JSON.parse(localStorage.getItem(DB_RECORDS)) || [];
    const record = allRecords.find(r => r.id === id);
    if (!record) return;
    
    // Load data into Step 1
    const plotNameInput = document.getElementById('plot-name');
    if (plotNameInput) plotNameInput.value = record.plotName || '';
    
    const inputs = document.querySelectorAll('.dynamic-input');
    inputs.forEach(input => {
        const fieldId = input.getAttribute('data-id');
        if (record.data && record.data[fieldId]) {
            input.value = record.data[fieldId].value;
        }
    });
    
    window.editingRecordId = id;
    
    switchDashboardTab('analyze');
    goToWizardStep(1);
    
    // Show a small toast or alert
    alert('ข้อมูลถูกโหลดเข้าสู่แบบฟอร์มเพื่อแก้ไขแล้ว เมื่อคุณกดวิเคราะห์และบันทึก จะเป็นการแก้ไขข้อมูลเดิม');
};

// Delete Record
window.deleteRecord = function(id) {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบประวัติการวิเคราะห์ดินรายการนี้? (การกระทำนี้ไม่สามารถย้อนกลับได้)')) {
        let allRecords = JSON.parse(localStorage.getItem(DB_RECORDS)) || [];
        allRecords = allRecords.filter(r => r.id !== id);
        localStorage.setItem(DB_RECORDS, JSON.stringify(allRecords));
        renderHistory();
    }
};

// Export to Image (PNG) using html2canvas
window.exportAnalysisImage = function(elementId, filename) {
    const targetElement = document.getElementById(elementId) || document.querySelector(elementId);
    if (!targetElement) {
        alert('ไม่พบส่วนที่ต้องการส่งออกรูปภาพ');
        return;
    }
    
    if (typeof html2canvas === 'undefined') {
        alert('ไลบรารีสำหรับบันทึกรูปภาพยังโหลดไม่เสร็จสมบูรณ์ โปรดลองอีกครั้ง');
        return;
    }
    
    const e = window.event;
    const btn = e ? e.currentTarget : null;
    let btnText = '';
    
    if (btn) {
        btnText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังประมวลผล...';
    }
    
    html2canvas(targetElement, {
        scale: 2, // High resolution
        backgroundColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#0f172a' : '#f1f5f9',
        useCORS: true,
        onclone: function (clonedDoc) {
            const el = clonedDoc.getElementById(elementId) || clonedDoc.querySelector(elementId);
            if (el) {
                el.style.display = 'block';
            }
        }
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        if (imgData === 'data:,') {
            throw new Error('Canvas is empty or corrupted');
        }
        const link = document.createElement('a');
        link.download = filename;
        link.href = imgData;
        link.click();
        if (btn) btn.innerHTML = btnText;
    }).catch(err => {
        console.error('Error generating image:', err);
        alert('เกิดข้อผิดพลาดในการสร้างรูปภาพ');
        if (btn) btn.innerHTML = btnText;
    });
};

// Export to PDF using html2pdf
window.exportAnalysisPDF = function(elementId, filename) {
    const targetElement = document.getElementById(elementId) || document.querySelector(elementId);
    if (!targetElement) {
        alert('ไม่พบส่วนที่ต้องการส่งออก PDF');
        return;
    }
    
    if (typeof html2pdf === 'undefined') {
        alert('ไลบรารีสำหรับสร้าง PDF ยังโหลดไม่เสร็จสมบูรณ์');
        return;
    }
    
    const e = window.event;
    const btn = e ? e.currentTarget : null;
    let btnText = '';
    
    if (btn) {
        btnText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังประมวลผล...';
    }
    
    const opt = {
        margin:       10,
        filename:     filename || 'SmartSoil_Report.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2, 
            useCORS: true, 
            backgroundColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#0f172a' : '#f1f5f9',
            onclone: function (clonedDoc) {
                const el = clonedDoc.getElementById(elementId) || clonedDoc.querySelector(elementId);
                if (el) {
                    el.style.display = 'block';
                }
            }
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(targetElement).save().then(() => {
        if (btn) btn.innerHTML = btnText;
    }).catch(err => {
        console.error('Error generating PDF:', err);
        if (btn) btn.innerHTML = btnText;
    });
};

// Helper: Generate Mobile Cards HTML
function generateMobileCardsHtml(advices) {
    if (!advices || !Array.isArray(advices)) return '';
    return advices.map(a => {
        const isObj = typeof a === 'object';
        const fieldName = isObj ? a.fieldName : 'ตัวแปรดิน';
        const stdMin = isObj ? a.stdMin : '-';
        const stdMax = isObj ? a.stdMax : '-';
        const unit = isObj ? a.unit : '';
        const val = isObj ? a.val : '-';
        const statusHtml = isObj ? a.statusHtml : '';
        const adviceText = isObj ? a.adviceText : a;

        return `
            <div class="mobile-analysis-card">
                <div class="mobile-card-header">
                    <span class="mobile-card-title"><i class="fas fa-flask text-emerald mr-1"></i> ${fieldName}</span>
                    <div class="mobile-card-status">${statusHtml}</div>
                </div>
                <div class="mobile-card-body">
                    <div class="mobile-metric-item">
                        <span class="metric-label">ค่ามาตรฐาน</span>
                        <span class="metric-val std-val">${stdMin} - ${stdMax} ${unit}</span>
                    </div>
                    <div class="mobile-metric-item">
                        <span class="metric-label">ค่าที่วัดได้</span>
                        <span class="metric-val measured-val">${val} ${unit}</span>
                    </div>
                </div>
                ${adviceText ? `
                <div class="mobile-card-footer">
                    <i class="fas fa-lightbulb text-warning mr-1"></i> ${adviceText}
                </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    renderDynamicFields();
    goToWizardStep(1);
});
