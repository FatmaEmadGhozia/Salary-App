
// ─── Salary calculations ──────────────────────────────────────────────────────

function monthlyHours(dayHours, weekDays, weekNums) {
    return dayHours * weekDays * weekNums; // 8 * 5 * 4 = 160
}

function hourValue(basicSalary, monthlyHour) {
    return basicSalary / monthlyHour;
}

function extraHoursValue(extraHours, hourVal) {
    return extraHours * hourVal;
}

function grossSalary(basicSalary, bonus, penalty, extraHRValue) {
    return basicSalary + bonus - penalty + extraHRValue;
}

function TaxValue(gross, tax) {
    return gross * tax;
}

function Netsalary(gross, taxVal) {
    return gross - taxVal;
}

// ─── Stats counters (kept for compatibility) ──────────────────────────────────

function totalEmployess() {
    // Now driven by showData() reading localStorage — this is a no-op placeholder
}

// ─── Currency conversion ──────────────────────────────────────────────────────

async function getCurrencyRate(currency) {
    if (currency === 'EGP') return 1;
    const apiKey = '8e16d6ee9fcc36ea3920a01a';
    const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${currency}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data.conversion_rates.EGP;
}

function convertToEGP(amount, rate) {
    return parseFloat((amount * rate).toFixed(2));
}

// ─── Account management ───────────────────────────────────────────────────────

function initAccounts() {
    if (localStorage.getItem('accounts') === null) {
        const defaults = [{ name: 'Admin', password: '12345' }];
        localStorage.setItem('accounts', JSON.stringify(defaults));
    }
}

// function createAccount(name, password = '123') {
//     initAccounts();
//     const accounts = JSON.parse(localStorage.getItem('accounts'));
//     // Prevent duplicate usernames
//     if (accounts.find(a => a.name.toLowerCase() === name.toLowerCase())) {
//         return { success: false, message: 'Username already exists.' };
//     }
//     accounts.push({ name, password });
//     localStorage.setItem('accounts', JSON.stringify(accounts));
//     return { success: true };
// }

// function loginAccount(name, password) {
//     initAccounts();
//     const accounts = JSON.parse(localStorage.getItem('accounts'));
//     const user = accounts.find(
//         a => a.name.toLowerCase() === name.toLowerCase() && a.password === password
//     );
//     if (user) {
//         sessionStorage.setItem('loggedIn', 'true');
//         sessionStorage.setItem('username', user.name);
//         return { success: true, name: user.name };
//     }
//     return { success: false, message: 'Invalid username or password.' };
// }


function loginAccount(username, password) {
    let accounts = JSON.parse(localStorage.getItem('accounts')) || [];

    // Admin
    if (username === 'Admin' && password === '12345') {
        return { success: true, role: 'admin' };
    }

    // Employees
    let user = accounts.find(acc =>
        acc.name === username && acc.password === password
    );

    if (user) {
        return { success: true, role: 'employee' };
    }

    return { success: false, message: "Invalid username or password" };
}

function logout() {
    sessionStorage.removeItem('loggedIn');
    sessionStorage.removeItem('username');
    window.location.href = './login.html';
}

function requireLogin() {
    if (sessionStorage.getItem('loggedIn') !== 'true') {
        window.location.href = './login.html';
    }
}
















