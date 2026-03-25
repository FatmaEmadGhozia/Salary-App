

// ─── Auth guard ───────────────────────────────────────────────────────────────
requireLogin();

// Show logged-in username in navbar
const loggedUser = sessionStorage.getItem('username') || 'Admin';
document.getElementById('nav-username').textContent = loggedUser;
document.getElementById('nav-avatar').textContent = loggedUser.substring(0, 2).toUpperCase();

// ─── Dynamic date ─────────────────────────────────────────────────────────────
(function setPayrollDate() {
    const now = new Date();
    const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const quarter = 'Q' + (Math.ceil((now.getMonth() + 1) / 3));
    document.getElementById('payroll-date').textContent =
        now.toLocaleDateString('en-US', opts) + ' · ' + quarter + ' Payroll Period';
})();

// ─── Validation ───────────────────────────────────────────────────────────────

function showError(id, message) {
    const input = document.getElementById(id);
    input.classList.add('is-invalid');
    let existing = input.parentElement.querySelector('.invalid-feedback');
    if (existing) existing.remove();
    const error = document.createElement('div');
    error.className = 'invalid-feedback d-block';
    error.style.cssText = 'color:#dc3545; font-size:13px; margin-top:4px;';
    error.textContent = message;
    input.parentElement.appendChild(error);
}

function clearError(id) {
    const input = document.getElementById(id);
    input.classList.remove('is-invalid');
    const existing = input.parentElement.querySelector('.invalid-feedback');
    if (existing) existing.remove();
}

function validateForm() {
    let isValid = true;
    const fullname = document.getElementById('fullname').value.trim();
    const salary = document.getElementById('salary').value.trim();
    const bonus = document.getElementById('bonus').value.trim();

    if (!fullname) {
        showError('fullname', 'Full name is required.'); isValid = false;
    } else { clearError('fullname'); }

    if (!salary || isNaN(salary) || +salary <= 0) {
        showError('salary', 'Enter a valid salary greater than 0.'); isValid = false;
    } else { clearError('salary'); }

    if (bonus === '' || isNaN(bonus) || +bonus < 0) {
        showError('bonus', 'Enter a valid bonus (0 or more).'); isValid = false;
    } else { clearError('bonus'); }

    return isValid;
}

['fullname', 'salary', 'bonus'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => clearError(id));
});

// ─── Submit ───────────────────────────────────────────────────────────────────

document.getElementById('add-emp-btn').addEventListener('click', async function () {
    if (!validateForm()) return;

    // Show loading state
    this.disabled = true;
    this.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Adding...';

    try {
        const fullname = document.getElementById('fullname').value.trim();
        const salaryRaw = +document.getElementById('salary').value;
        const bonusRaw = +document.getElementById('bonus').value;
        const penaltyRaw = +document.getElementById('penalty').value || 0;
        const extraHours = +document.getElementById('extra-hours').value || 0;
        const title = document.getElementById('title').value;
        const currency = document.getElementById('currency').value;

        // Convert to EGP if needed
        let rate = 1;
        if (currency !== 'EGP') {
            rate = await getCurrencyRate(currency);
        }

        const salary = convertToEGP(salaryRaw, rate);
        const bonus = convertToEGP(bonusRaw, rate);
        const penalty = convertToEGP(penaltyRaw, rate);

        const monthlyHrs = monthlyHours(8, 5, 4);
        const hrValue = parseFloat(hourValue(salary, monthlyHrs).toFixed(2));
        const extraTotal = parseFloat(extraHoursValue(extraHours, hrValue).toFixed(2));
        const gross = parseFloat(grossSalary(salary, bonus, penalty, extraTotal).toFixed(2));
        const tax = 0.1;
        const taxValue = parseFloat(TaxValue(gross, tax).toFixed(2));
        const netSalary = parseFloat(Netsalary(gross, taxValue).toFixed(2));

        const employee = [
            fullname,     // 0
            title,        // 1
            currency,     // 2
            salary,       // 3  — in EGP
            bonus,        // 4
            penalty,      // 5
            extraHours,   // 6
            hrValue,      // 7
            extraTotal,   // 8
            gross,        // 9
            tax,          // 10
            taxValue,     // 11
            netSalary,    // 12
            rate          // 13 — conversion rate used
        ];

        const myData = JSON.parse(localStorage.getItem('show') || '[]');
        myData.push(employee);
        localStorage.setItem('show', JSON.stringify(myData));
        let empAccount = {
            name: fullname,
            password: "123",
            role: "employee"
        };
        let allAccounts = JSON.parse(localStorage.getItem('accounts'));
        allAccounts.push(empAccount);
        localStorage.setItem('accounts', JSON.stringify(allAccounts));
        console.log(localStorage.getItem('accounts'));
        document.getElementById('emp-form').reset();


        showData();
        updateStats();

    } catch (err) {
        alert('Failed to fetch currency rate. Please check your connection and try again.');
        console.error(err);
    }

    this.disabled = false;
    this.innerHTML = '<i class="bi bi-plus"></i> Add Employee';
});

// ─── Render table ─────────────────────────────────────────────────────────────

function showData() {
    const data = JSON.parse(localStorage.getItem('show') || '[]');
    const tbody = document.querySelector('.table tbody');
    tbody.innerHTML = '';

    data.forEach(function (emp, index) {
        const wasConverted = emp[2] !== 'EGP' && emp[13] && emp[13] !== 1;
        const currencyBadge = wasConverted
            ? `<span class="converting-badge" title="Converted from ${emp[2]} at rate ${emp[13]}">${emp[2]}→EGP</span>`
            : `<span style="font-size:12px; background:#f1efe8; color:#666; padding:2px 8px; border-radius:12px; font-weight:600;">${emp[2]}</span>`;

        const tr = document.createElement('tr');
        tr.dataset.index = index;
        tr.innerHTML = `
            <td>
                <div class="d-flex align-items-center gap-2">
                    <div class="av rounded-circle" style="background:#B5D4F4; color:#0C447C; padding:2px 7px; font-weight:700; font-size:13px;">
                        ${emp[0].substring(0, 2).toUpperCase()}
                    </div>
                    <span style="font-weight:500;">${emp[0]}</span>
                </div>
            </td>
            <td><span class="badge-op">${emp[1]}</span></td>
            <td>${currencyBadge}</td>
            <td>${Number(emp[3]).toLocaleString()}</td>
            <td style="color:#0F6E56; font-weight:500;">+${Number(emp[4]).toLocaleString()}</td>
            <td style="color:#aaa;">${Number(emp[5]).toLocaleString()}</td>
            <td style="color:#3C3489; font-weight:600;">${emp[6]} hrs</td>
            <td>${Number(emp[7]).toLocaleString()}</td>
            <td>${Number(emp[8]).toLocaleString()}</td>
            <td style="font-weight:600;">${Number(emp[9]).toLocaleString()}</td>
            <td><span style="font-size:12px; background:#FAEEDA; color:#854F0B; padding:2px 8px; border-radius:12px; font-weight:600;">${emp[10] * 100}%</span></td>
            <td style="color:#A32D2D;">-${Number(emp[11]).toLocaleString()}</td>
            <td style="font-weight:700; color:#0C447C;">${Number(emp[12]).toLocaleString()}</td>
            <td><button class="delete-btn border-0 px-2 py-1 rounded"><i class="bi bi-trash"></i></button></td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelector('.empNum').textContent = data.length;
}

// ─── Dynamic stat cards ───────────────────────────────────────────────────────

function updateStats() {
    const data = JSON.parse(localStorage.getItem('show') || '[]');

    const totalEmp = data.length;
    const totalGross = data.reduce((sum, emp) => sum + (emp[9] || 0), 0);
    const totalBonuses = data.reduce((sum, emp) => sum + (emp[4] || 0), 0);
    const totalNet = data.reduce((sum, emp) => sum + (emp[12] || 0), 0);

    document.getElementById('total-emp').textContent = totalEmp;
    document.getElementById('total-gross').textContent = totalGross.toLocaleString('en-EG', { maximumFractionDigits: 2 });
    document.getElementById('total-bonuses').textContent = totalBonuses.toLocaleString('en-EG', { maximumFractionDigits: 2 });
    document.getElementById('total-net').textContent = totalNet.toLocaleString('en-EG', { maximumFractionDigits: 2 });
}

// ─── Delete row + remove from localStorage ────────────────────────────────────

document.querySelector('.table tbody').addEventListener('click', function (e) {
    const btn = e.target.closest('.delete-btn');
    if (!btn) return;

    const tr = btn.closest('tr');
    const index = parseInt(tr.dataset.index, 10);

    const myData = JSON.parse(localStorage.getItem('show') || '[]');
    myData.splice(index, 1);
    localStorage.setItem('show', JSON.stringify(myData));

    showData();
    updateStats();
});

// ─── Export CSV ───────────────────────────────────────────────────────────────

function exportReport() {
    const data = JSON.parse(localStorage.getItem('show') || '[]');
    if (!data.length) { alert('No employee data to export.'); return; }

    const headers = ['Name', 'Title', 'Currency', 'Basic(EGP)', 'Bonus(EGP)', 'Penalty', 'ExtraHrs', 'HrValue', 'ExtraTotal', 'Gross', 'Tax%', 'TaxValue', 'NetSalary'];
    const rows = data.map(e => headers.map((_, i) => e[i] ?? '').join(','));
    const csv = [headers.join(','), ...rows].join('\n');

    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'salary_report.csv';
    a.click();
}

// ─── Init ─────────────────────────────────────────────────────────────────────

showData();
updateStats();




