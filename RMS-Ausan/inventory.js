let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let currentHistoryIndex = null;

function saveInventory() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

function renderInventory(filter = '') {
    const tbody = document.getElementById('inventoryTable');
    const emptyMsg = document.getElementById('emptyMessage');
    tbody.innerHTML = '';

    const filtered = inventory.filter(item =>
        item.name.toLowerCase().includes(filter.toLowerCase())
    );

    if (filtered.length === 0) {
        emptyMsg.style.display = 'block';
        return;
    }

    emptyMsg.style.display = 'none';

    filtered.forEach((item, globalIndex) => {
        const originalIndex = inventory.indexOf(item);
        const totalValue = (item.quantity * item.cost).toFixed(2);
        const qtyClass = item.quantity <= 5 ? 'low-stock' : '';
        const services = item.usedInServices ? item.usedInServices.join(', ') : 'None';

        const row = document.createElement('tr');
        row.innerHTML = `
                <td>${item.name}</td>
                <td class="${qtyClass}">${item.quantity}</td>
                <td>₱${item.cost.toFixed(2)}</td>
                <td>₱${totalValue}</td>
                <td>${services}</td>
                <td>
                    <button class="btn btn-warning" style="font-size:13px; padding:6px 12px; margin-right:6px;"
                            onclick="openEditModal(${originalIndex})">
                        Edit
                    </button>
                    <button class="btn btn-danger" style="font-size:13px; padding:6px 12px; margin-right:6px;"
                            onclick="openDeductModal(${originalIndex})">
                        Deduct
                    </button>
                    <button class="btn btn-primary" style="font-size:13px; padding:6px 12px;"
                            onclick="openHistoryModal(${originalIndex})">
                        <i class="fas fa-history"></i> History
                    </button>
                </td>
            `;
        tbody.appendChild(row);
    });
}

function filterInventory() {
    const query = document.getElementById('searchInput').value;
    renderInventory(query);
}

function openAddModal() {
    document.getElementById('addModal').style.display = 'flex';
    document.getElementById('addForm').reset();
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function openEditModal(index) {
    const item = inventory[index];
    document.getElementById('editIndex').value = index;
    document.getElementById('editName').value = item.name;
    document.getElementById('editQuantity').value = item.quantity;
    document.getElementById('editCost').value = item.cost;

    // Pre-select services
    const select = document.getElementById('editUsedInServices');
    Array.from(select.options).forEach(option => {
        option.selected = item.usedInServices?.includes(option.value) || false;
    });

    document.getElementById('editModal').style.display = 'flex';
}

function openDeductModal(index) {
    document.getElementById('deductModal').style.display = 'flex';
    document.getElementById('deductIndex').value = index;
    document.getElementById('deductForm').reset();
}

function openHistoryModal(index) {
    currentHistoryIndex = index;
    const item = inventory[index];
    document.getElementById('historyProductName').textContent = item.name;

    document.getElementById('historyFromDate').value = '';
    document.getElementById('historyToDate').value = '';

    renderHistoryList(item.usageHistory || []);

    document.getElementById('historyModal').style.display = 'flex';

    setTimeout(() => renderStockTrend(index), 100);
}

function renderHistoryList(history) {
    const list = document.getElementById('historyList');
    list.innerHTML = '';

    if (!history || history.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#95a5a6;">No usage history found in selected date range.</p>';
        return;
    }

    history.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
                <strong>${new Date(entry.timestamp).toLocaleString()}</strong><br>
                Deducted: <strong>${entry.quantity}</strong> units<br>
                Reason: ${entry.reason}
            `;
        list.appendChild(div);
    });
}

function filterHistory() {
    if (currentHistoryIndex === null) return;

    const item = inventory[currentHistoryIndex];
    const history = item.usageHistory || [];

    const fromDate = document.getElementById('historyFromDate').value;
    const toDate = document.getElementById('historyToDate').value;

    let filtered = history;

    if (fromDate) {
        const from = new Date(fromDate).setHours(0, 0, 0, 0);
        filtered = filtered.filter(entry => new Date(entry.timestamp) >= from);
    }

    if (toDate) {
        const to = new Date(toDate).setHours(23, 59, 59, 999);
        filtered = filtered.filter(entry => new Date(entry.timestamp) <= to);
    }

    renderHistoryList(filtered);
}

function renderStockTrend(index) {
    const item = inventory[index];
    const history = item.usageHistory ? [...item.usageHistory].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) : [];

    let currentStock = item.quantity;
    const labels = [];
    const data = [];

    for (let i = history.length - 1; i >= 0; i--) {
        labels.unshift(new Date(history[i].timestamp).toLocaleDateString());
        data.unshift(currentStock);
        currentStock += history[i].quantity;
    }

    labels.push('Now');
    data.push(item.quantity);

    const ctx = document.getElementById('stockChart').getContext('2d');
    if (ctx.chart) ctx.chart.destroy();

    ctx.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Stock Level Over Time',
                data,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                tension: 0.2,
                fill: true,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointHoverRadius: 8,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Quantity' } },
                x: { title: { display: true, text: 'Date' } }
            }
        }
    });
}

function exportHistoryToCSV() {
    if (currentHistoryIndex === null) return;

    const item = inventory[currentHistoryIndex];
    const history = item.usageHistory || [];

    let csv = 'Date,Quantity Deducted,Reason\n';
    history.forEach(entry => {
        const date = new Date(entry.timestamp).toLocaleString().replace(/,/g, '');
        csv += `${date},${entry.quantity},"${entry.reason.replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.name.replace(/\s+/g, '_')}_usage_history.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

// Add product
document.getElementById('addForm').addEventListener('submit', e => {
    e.preventDefault();

    const name = document.getElementById('productName').value.trim();
    const qty = parseInt(document.getElementById('quantity').value);
    const cost = parseFloat(document.getElementById('cost').value);
    const usedInServices = Array.from(document.getElementById('usedInServices').selectedOptions).map(opt => opt.value);

    if (!name || isNaN(qty) || qty < 0 || isNaN(cost) || cost < 0) {
        alert('Please fill all fields correctly.');
        return;
    }

    const exists = inventory.some(item => item.name.toLowerCase() === name.toLowerCase());
    if (exists) {
        alert('A product with this name already exists!');
        return;
    }

    inventory.push({
        name,
        quantity: qty,
        cost,
        usedInServices: usedInServices.length > 0 ? usedInServices : [],
        usageHistory: []
    });

    saveInventory();
    renderInventory(document.getElementById('searchInput').value);
    closeModal('addModal');
    alert('Product added successfully.');
});

// Edit product
document.getElementById('editForm').addEventListener('submit', e => {
    e.preventDefault();

    const index = parseInt(document.getElementById('editIndex').value);
    const newName = document.getElementById('editName').value.trim();
    const newQty = parseInt(document.getElementById('editQuantity').value);
    const newCost = parseFloat(document.getElementById('editCost').value);
    const usedInServices = Array.from(document.getElementById('editUsedInServices').selectedOptions).map(opt => opt.value);

    if (!newName || isNaN(newQty) || newQty < 0 || isNaN(newCost) || newCost < 0) {
        alert('Please fill all fields correctly.');
        return;
    }

    const duplicate = inventory.some((item, i) =>
        i !== index && item.name.toLowerCase() === newName.toLowerCase()
    );
    if (duplicate) {
        alert('Another product with this name already exists!');
        return;
    }

    inventory[index].name = newName;
    inventory[index].quantity = newQty;
    inventory[index].cost = newCost;
    inventory[index].usedInServices = usedInServices.length > 0 ? usedInServices : [];

    saveInventory();
    renderInventory(document.getElementById('searchInput').value);
    closeModal('editModal');
    alert('Product updated successfully.');
});

// Deduct stock + log usage
document.getElementById('deductForm').addEventListener('submit', e => {
    e.preventDefault();

    const index = parseInt(document.getElementById('deductIndex').value);
    const qty = parseInt(document.getElementById('deductQty').value);
    const reason = document.getElementById('deductReason').value.trim();

    if (isNaN(qty) || qty <= 0 || qty > inventory[index].quantity) {
        alert('Invalid quantity.');
        return;
    }

    inventory[index].quantity -= qty;

    if (!inventory[index].usageHistory) inventory[index].usageHistory = [];
    inventory[index].usageHistory.push({
        timestamp: new Date().toISOString(),
        quantity: qty,
        reason: reason || 'No reason provided'
    });

    saveInventory();
    renderInventory(document.getElementById('searchInput').value);
    closeModal('deductModal');
    alert(`Deducted ${qty} units. Reason: ${reason}`);
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

// Init
renderInventory();

if (!localStorage.getItem('currentUser')) {
    window.location.href = 'login.html';
}