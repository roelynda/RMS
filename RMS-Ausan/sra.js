let currentStep = 1;
let salesData = [];

function updateStepper() {
    for (let i = 1; i <= 4; i++) {
        const step = document.getElementById(`step${i}`);
        step.classList.remove('active', 'completed');
        if (i < currentStep) step.classList.add('completed');
        if (i === currentStep) step.classList.add('active');
    }

    document.querySelectorAll('.step-content').forEach(c => c.classList.add('hidden'));
    document.getElementById(currentStep === 1 ? 'collectData' : currentStep === 2 ? 'generateReport' : currentStep === 3 ? 'reviseReport' : 'analyzeData').classList.remove('hidden');
}

function loadSalesData() {
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const payrolls = JSON.parse(localStorage.getItem('payrolls')) || [];
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];

    salesData = [];

    // Service sales
    appointments.filter(a => a.status === 'Completed' && a.sales > 0).forEach(a => {
        salesData.push({
            type: 'Service',
            employee: a.specialistId,
            date: a.datetime.split('T')[0],
            amount: a.sales,
            details: `Service: ${a.service} for ${a.customerName}`
        });
    });

    // Payroll commissions
    payrolls.filter(p => p.approved).forEach(p => {
        salesData.push({
            type: 'Payroll Commission',
            employee: p.empId,
            date: p.period,
            amount: p.commission,
            details: `Commission for period ${p.period}`
        });
    });

    // Update counts
    document.getElementById('serviceCount').textContent = appointments.length;
    document.getElementById('payrollCount').textContent = payrolls.length;
    document.getElementById('inventoryCount').textContent = inventory.length;
}

function renderReportTable(tbodyId, showActions = false) {
    const tbody = document.getElementById(tbodyId);
    tbody.innerHTML = '';
    salesData.forEach((sale, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
                <td>${sale.type}</td>
                <td>${sale.employee}</td>
                <td>${sale.date}</td>
                <td>₱${sale.amount.toFixed(2)}</td>
                <td>${sale.details}</td>
                ${showActions ? `<td><button class="btn btn-danger" style="font-size:13px; padding:6px 12px;" onclick="removeSale(${index})">Remove</button></td>` : '<td></td>'}
            `;
        tbody.appendChild(row);
    });
}

function proceedToGenerate() {
    loadSalesData();
    if (salesData.length === 0) {
        alert('No sales data available.');
        return;
    }
    currentStep = 2;
    updateStepper();
    renderReportTable('reportTable');
}

function confirmReport(isCorrect) {
    if (isCorrect) {
        currentStep = 4;
        updateStepper();
        performAnalysis();
    } else {
        currentStep = 3;
        updateStepper();
        renderReportTable('reviseTable', true);
    }
}

function regenerateReport() {
    currentStep = 2;
    updateStepper();
    renderReportTable('reportTable');
}

function removeSale(index) {
    if (confirm('Remove this entry?')) {
        salesData.splice(index, 1);
        renderReportTable('reviseTable', true);
    }
}

function performAnalysis() {
    const totalSales = salesData.reduce((sum, s) => sum + s.amount, 0);
    const avgSale = salesData.length > 0 ? totalSales / salesData.length : 0;
    const totalPayroll = salesData.filter(s => s.type === 'Payroll Commission').reduce((sum, s) => sum + s.amount, 0);
    const netProfit = totalSales - totalPayroll;

    // Inventory cost
    const inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    const totalInventoryCost = inventory.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
    const lowStockCount = inventory.filter(item => item.quantity <= 5).length;

    document.getElementById('totalSales').textContent = `₱${totalSales.toFixed(2)}`;
    document.getElementById('totalPayroll').textContent = `₱${totalPayroll.toFixed(2)}`;
    document.getElementById('netProfit').textContent = `₱${netProfit.toFixed(2)}`;
    document.getElementById('avgSale').textContent = `₱${avgSale.toFixed(2)}`;
    document.getElementById('totalInventoryCost').textContent = `₱${totalInventoryCost.toFixed(2)}`;
    document.getElementById('lowStockCount').textContent = lowStockCount;

    // Employee performance
    const performance = {};
    salesData.forEach(sale => {
        if (!performance[sale.employee]) {
            performance[sale.employee] = { sales: 0, services: 0, commissions: 0 };
        }
        performance[sale.employee].sales += sale.amount;
        if (sale.type === 'Service') performance[sale.employee].services += 1;
        if (sale.type === 'Payroll Commission') performance[sale.employee].commissions += sale.amount;
    });

    const perfTbody = document.getElementById('performanceTableBody');
    perfTbody.innerHTML = '';
    Object.entries(performance).forEach(([emp, data]) => {
        const avg = data.services > 0 ? data.sales / data.services : 0;
        const row = document.createElement('tr');
        row.innerHTML = `
                <td>${emp}</td>
                <td>₱${data.sales.toFixed(2)}</td>
                <td>${data.services}</td>
                <td>₱${data.commissions.toFixed(2)}</td>
                <td>₱${avg.toFixed(2)}</td>
            `;
        perfTbody.appendChild(row);
    });

    // Chart
    const ctx = document.getElementById('salesChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Total Sales', 'Payroll Costs', 'Net Profit', 'Inventory Costs'],
            datasets: [{
                label: 'Amount (₱)',
                data: [totalSales, totalPayroll, netProfit, totalInventoryCost],
                backgroundColor: ['#667eea', '#f39c12', '#27ae60', '#95a5a6']
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

function resetFlow() {
    currentStep = 1;
    salesData = [];
    updateStepper();
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
    document.getElementById('mainContent').classList.toggle('collapsed');
}

function logout() {
    if (confirm('Logout?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

// Init
updateStepper();

// Protect page
if (!localStorage.getItem('currentUser')) {
    window.location.href = 'login.html';
}