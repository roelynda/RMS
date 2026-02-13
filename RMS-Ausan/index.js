// Check if user is logged in
const user = JSON.parse(localStorage.getItem('currentUser'));
if (!user) {
    window.location.href = 'Sign-in/signin.html'; // redirect to your login page
} else {
    document.getElementById('currentUser').textContent = user.name || user.email.split('@')[0];
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'Sign-in/signin.html';
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
    document.getElementById('mainContent').classList.toggle('collapsed');
}

// Simple stats (you can connect to real data from localStorage)
function updateDashboardStats() {
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const payrolls = JSON.parse(localStorage.getItem('payrolls')) || [];

    document.getElementById('statCustomers').textContent = customers.length;
    document.getElementById('statAppointments').textContent = appointments.filter(a => a.status === 'Pending' || a.status === 'Ongoing').length;
    document.getElementById('statPendingPayroll').textContent = payrolls.filter(p => !p.approved).length;

    // Today's sales (very basic)
    const today = new Date().toISOString().split('T')[0];
    const todaySales = appointments
        .filter(a => a.datetime.startsWith(today) && a.status === 'Completed')
        .reduce((sum, a) => sum + (a.sales || 0), 0);
    document.getElementById('statTodaySales').textContent = `₱${todaySales.toFixed(2)}`;
}

// Run on load
updateDashboardStats();

// Optional: highlight active menu item when clicking links (if using same-page navigation)
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function (e) {
        if (!this.getAttribute('href').startsWith('#')) return;
        e.preventDefault();
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});