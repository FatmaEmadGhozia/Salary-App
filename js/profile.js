// ─── Auth guard 
(function () {
    const loggedIn = sessionStorage.getItem('loggedIn');
    const role = sessionStorage.getItem('role');

    if (loggedIn !== 'true' || role !== 'employee') {
        window.location.href = './login.html';
    }
})();

// ─── Get current user
const currentUser = sessionStorage.getItem('username');

// ─── Load employees data 
const data = JSON.parse(localStorage.getItem('show') || '[]');

// ─── Find logged user data 
const user = data.find(emp => emp[0] === currentUser);

// ─── Render user row
const tbody = document.querySelector('tbody');
tbody.innerHTML = '';

if (user) {
    const tr = document.createElement('tr');

    tr.innerHTML = `
        <td>${user[0]}</td>
        <td>${user[1]}</td>
        <td>${user[2]}</td>
        <td>${Number(user[3]).toLocaleString()}</td>
        <td>${Number(user[4]).toLocaleString()}</td>
        <td>${Number(user[5]).toLocaleString()}</td>
        <td>${user[6]}</td>
        <td>${Number(user[7]).toLocaleString()}</td>
        <td>${Number(user[8]).toLocaleString()}</td>
        <td>${Number(user[9]).toLocaleString()}</td>
        <td>${user[10] * 100}%</td>
        <td>${Number(user[11]).toLocaleString()}</td>
        <td>${Number(user[12]).toLocaleString()}</td>
    `;

    tbody.appendChild(tr);
} else {
    tbody.innerHTML = `<tr><td colspan="13" class="text-center">No data found for this user</td></tr>`;
}

// ─── Update stats cards (optional) 
if (user) {
    document.getElementById('profile-total-emp').textContent = 1;
    document.getElementById('profile-gross').textContent = user[9];
    document.getElementById('profile-bonus').textContent = user[4];
    document.getElementById('profile-net').textContent = user[12];
}
