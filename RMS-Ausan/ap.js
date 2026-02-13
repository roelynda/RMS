let employees = JSON.parse(localStorage.getItem('employees')) || [];
let attendance = JSON.parse(localStorage.getItem('attendance')) || [];
let payrolls = JSON.parse(localStorage.getItem('payrolls')) || [];
let cashAdvances = JSON.parse(localStorage.getItem('cashAdvances')) || [];
let currentPayrollIndex = null;

function saveData() {
    localStorage.setItem('attendance', JSON.stringify(attendance));
    localStorage.setItem('payrolls', JSON.stringify(payrolls));
    localStorage.setItem('cashAdvances', JSON.stringify(cashAdvances));
}

function showTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector(`.tab[onclick="showTab('${tabId}')"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');

    if (tabId === 'attendance') renderAttendance();
    if (tabId === 'payroll') renderPayroll();
    if (tabId === 'cashAdvances') renderCashAdvances();
}

function populateEmployeeSelects() {
    const selects = [
        document.getElementById('employeeSelect'),
        document.getElementById('payEmployee'),
        document.getElementById('caEmployee')
    ];
    selects.forEach(select => {
        if (!select) return;
        select.innerHTML = '<option value="">Select Employee</option>';
        employees.forEach(emp => {
            const opt = document.createElement('option');
            opt.value = emp.id || emp.name;
            opt.textContent = emp.name;
            select.appendChild(opt);
        });
    });
}

function renderAttendance() {
    const tbody = document.getElementById('attendanceTable');
    tbody.innerHTML = '';
    attendance.forEach(record => {
        const emp = employees.find(e => (e.id || e.name) === record.empId);
        const hours = record.timeOut
            ? ((new Date(`2000-01-01 ${record.timeOut}`) - new Date(`2000-01-01 ${record.timeIn}`)) / 3600000).toFixed(2)
            : '-';

        const row = document.createElement('tr');
        row.innerHTML = `
                <td>${emp?.name || 'Unknown'}</td>
                <td>${record.date}</td>
                <td>${record.timeIn || '-'}</td>
                <td>${record.timeOut || '-'}</td>
                <td>${hours}</td>
                <td>${record.timeOut ? 'Complete' : 'Pending'}</td>
            `;
        tbody.appendChild(row);
    });
}

function renderPayroll() {
    const tbody = document.getElementById('payrollTable');
    tbody.innerHTML = '';
    payrolls.forEach((pay, index) => {
        const emp = employees.find(e => (e.id || e.name) === pay.empId);
        const row = document.createElement('tr');
        row.innerHTML = `
                <td>${emp?.name || 'Unknown'}</td>
                <td>${pay.period}</td>
                <td>₱${pay.gross?.toFixed(2) || '0.00'}</td>
                <td>₱${pay.cashAdvances?.toFixed(2) || '0.00'}</td>
                <td>₱${pay.net?.toFixed(2) || '0.00'}</td>
                <td>${pay.approved ? 'Approved' : 'Pending'}</td>
                <td>
                    <button class="btn btn-warning" style="font-size:13px; padding:6px 12px; margin-right:6px;" 
                            onclick="openApprovalModal(${index})">
                        ${pay.approved ? 'View' : 'Approve'}
                    </button>
                    ${!pay.approved ? `
                        <button class="btn btn-danger" style="font-size:13px; padding:6px 12px;" 
                                onclick="openDeletePayrollModal(${index})">
                            Delete
                        </button>
                    ` : ''}
                </td>
            `;
        tbody.appendChild(row);
    });
}

function renderCashAdvances() {
    const tbody = document.getElementById('advancesTable');
    tbody.innerHTML = '';
    cashAdvances.forEach(adv => {
        const emp = employees.find(e => (e.id || e.name) === adv.empId);
        const row = document.createElement('tr');
        row.innerHTML = `
                <td>${emp?.name || 'Unknown'}</td>
                <td>${adv.date}</td>
                <td>₱${adv.amount.toFixed(2)}</td>
                <td>${adv.deducted ? 'Yes' : 'No'}</td>
            `;
        tbody.appendChild(row);
    });
}

function openTimeModal() {
    document.getElementById('timeModal').style.display = 'flex';
    document.getElementById('attDate').value = new Date().toISOString().slice(0, 10);
    document.getElementById('timeIn').value = new Date().toTimeString().slice(0, 5);
}

function openCashAdvanceModal() {
    document.getElementById('cashAdvanceModal').style.display = 'flex';
    document.getElementById('caDate').value = new Date().toISOString().slice(0, 10);
}

function openPayrollModal() {
    document.getElementById('payrollModal').style.display = 'flex';
    document.getElementById('payPeriod').value = new Date().toISOString().slice(0, 7);
}

function openApprovalModal(index) {
    currentPayrollIndex = index;
    const pay = payrolls[index];
    const emp = employees.find(e => (e.id || e.name) === pay.empId);

    document.getElementById('approvalTitle').textContent = pay.approved ? 'View Payroll' : 'Approve Payroll';

    document.getElementById('approvalDetails').innerHTML = `
            <strong>Employee:</strong> ${emp?.name || 'Unknown'}<br>
            <strong>Period:</strong> ${pay.period}<br>
            <strong>Base Salary:</strong> ₱${pay.baseSalary?.toFixed(2) || '0.00'}<br>
            <strong>Commission (15%):</strong> ₱${pay.commission?.toFixed(2) || '0.00'}<br>
            <strong>Gross:</strong> ₱${pay.gross?.toFixed(2) || '0.00'}<br>
            <strong>Cash Advances Deducted:</strong> ₱${pay.cashAdvances?.toFixed(2) || '0.00'}<br>
            <strong>Net Pay:</strong> ₱${pay.net?.toFixed(2) || '0.00'}<br>
            <strong>Status:</strong> ${pay.approved ? 'Approved' : 'Pending'}
        `;

    const buttonsDiv = document.getElementById('approvalButtons');
    buttonsDiv.innerHTML = `
            <button type="button" class="btn btn-secondary" onclick="closeModal('approvalModal')">Close</button>
            ${!pay.approved ? `
                <button type="button" class="btn btn-primary" onclick="approvePayroll()">Approve</button>
            ` : ''}
        `;

    document.getElementById('approvalModal').style.display = 'flex';
}

function approvePayroll() {
    if (currentPayrollIndex === null) return;
    payrolls[currentPayrollIndex].approved = true;
    saveData();
    renderPayroll();
    closeModal('approvalModal');
    alert('Payroll approved successfully.');
}

function openDeletePayrollModal(index) {
    currentPayrollIndex = index;
    document.getElementById('deletePayrollModal').style.display = 'flex';
}

function confirmDeletePayroll() {
    if (currentPayrollIndex === null) return;
    payrolls.splice(currentPayrollIndex, 1);
    saveData();
    renderPayroll();
    closeModal('deletePayrollModal');
    alert('Payroll record deleted.');
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// Attendance Form
document.getElementById('timeForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const empId = document.getElementById('employeeSelect').value;
    const date = document.getElementById('attDate').value;
    const timeIn = document.getElementById('timeIn').value;
    const timeOut = document.getElementById('timeOut').value || null;

    if (!empId || !date || !timeIn) {
        alert('Please complete all required fields.');
        return;
    }

    const existing = attendance.find(a => a.empId === empId && a.date === date);
    if (existing) {
        if (timeOut) existing.timeOut = timeOut;
    } else {
        attendance.push({ empId, date, timeIn, timeOut });
    }

    saveData();
    renderAttendance();
    closeModal('timeModal');
    alert('Attendance recorded.');
});

// Cash Advance Form
document.getElementById('cashAdvanceForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const empId = document.getElementById('caEmployee').value;
    const date = document.getElementById('caDate').value;
    const amount = parseFloat(document.getElementById('caAmount').value);

    if (!empId || !date || isNaN(amount) || amount <= 0) {
        alert('Please fill all fields correctly.');
        return;
    }

    cashAdvances.push({ empId, date, amount, deducted: false });
    saveData();
    renderCashAdvances();
    closeModal('cashAdvanceModal');
    alert('Cash advance recorded.');
});

// Payroll Form – no tax, only base + commission - cash advances
document.getElementById('payrollForm')?.addEventListener('submit', e => {
    e.preventDefault();

    const empId = document.getElementById('payEmployee').value;
    const period = document.getElementById('payPeriod').value;
    const baseSalary = parseFloat(document.getElementById('baseSalary').value);
    const salesAmount = parseFloat(document.getElementById('salesAmount').value || 0);

    if (!empId || !period || isNaN(baseSalary) || baseSalary < 0) {
        alert('Please fill all required fields correctly.');
        return;
    }

    const commission = salesAmount * 0.15;
    const gross = baseSalary + commission;

    // Only deduct pending (not yet deducted) cash advances
    const pendingAdvances = cashAdvances
        .filter(ca => ca.empId === empId && !ca.deducted)
        .reduce((sum, ca) => sum + ca.amount, 0);

    const net = gross - pendingAdvances;

    payrolls.push({
        empId,
        period,
        baseSalary,
        commission,
        gross,
        cashAdvances: pendingAdvances,
        net,
        approved: false
    });

    // Mark these advances as deducted so they won't be deducted again
    cashAdvances.forEach(ca => {
        if (ca.empId === empId && !ca.deducted) ca.deducted = true;
    });

    saveData();
    renderPayroll();
    renderCashAdvances();
    closeModal('payrollModal');
    alert(`Payroll created!\nGross: ₱${gross.toFixed(2)}\nCash Advances: ₱${pendingAdvances.toFixed(2)}\nNet: ₱${net.toFixed(2)}`);
});

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
    document.getElementById('mainContent').classList.toggle('collapsed');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

// Initialize
populateEmployeeSelects();
showTab('attendance');

// Protect page
if (!localStorage.getItem('currentUser')) {
    window.location.href = 'login.html';
}