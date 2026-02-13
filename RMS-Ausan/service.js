let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
let customers = JSON.parse(localStorage.getItem('customers')) || [];
let employees = JSON.parse(localStorage.getItem('employees')) || [];
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let currentApptIndex = null;

function saveData() {
    localStorage.setItem('appointments', JSON.stringify(appointments));
    localStorage.setItem('customers', JSON.stringify(customers));
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

function showTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector(`.tab[onclick="showTab('${tabId}')"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');

    if (tabId === 'appointments') renderAppointments();
    if (tabId === 'execution') renderExecution();
    if (tabId === 'reports') renderReports();
}

function renderAppointments() {
    const tbody = document.getElementById('appointmentsTable');
    tbody.innerHTML = '';
    appointments.forEach((appt, index) => {
        const spec = employees.find(e => (e.id || e.name) === appt.specialistId);
        const row = document.createElement('tr');
        row.innerHTML = `
                <td>${appt.customerName}</td>
                <td>${appt.service}</td>
                <td>${new Date(appt.datetime).toLocaleString()}</td>
                <td>${spec?.name || 'Unassigned'}</td>
                <td class="status-${appt.status.toLowerCase()}">${appt.status}</td>
                <td>
                    <button class="btn btn-warning" style="font-size:13px; padding:6px 12px;" onclick="openAppointmentModal('edit', ${index})">
                        Edit
                    </button>
                    <button class="btn btn-primary" style="font-size:13px; padding:6px 12px; margin-left:6px;" onclick="openStatusModal(${index})">
                        Update Status
                    </button>
                </td>
            `;
        tbody.appendChild(row);
    });
}

function renderExecution() {
    const list = document.getElementById('executionList');
    list.innerHTML = '';
    const pending = appointments.filter(a => a.status === 'Pending' || a.status === 'Ongoing');
    if (pending.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#95a5a6; padding:40px 0;">No pending services.</p>';
        return;
    }
    pending.forEach((appt, index) => {
        const spec = employees.find(e => (e.id || e.name) === appt.specialistId);
        const card = document.createElement('div');
        card.className = 'service-card';
        card.innerHTML = `
                <strong>${appt.customerName}</strong> - ${appt.service}<br>
                <small>${new Date(appt.datetime).toLocaleString()} | Specialist: ${spec?.name || 'Unassigned'}</small><br>
                <small>Status: <span class="status-${appt.status.toLowerCase()}">${appt.status}</span></small>
                <div style="margin-top:12px; display:flex; gap:12px;">
                    <button class="btn btn-primary" onclick="openStatusModal(${index})">Update Status</button>
                </div>
            `;
        list.appendChild(card);
    });
}

function renderReports() {
    const tbody = document.getElementById('reportsTable');
    tbody.innerHTML = '';
    appointments.forEach(appt => {
        const spec = employees.find(e => (e.id || e.name) === appt.specialistId);
        const row = document.createElement('tr');
        row.innerHTML = `
                <td>${appt.customerName}</td>
                <td>${appt.service}</td>
                <td>${new Date(appt.datetime).toLocaleDateString()}</td>
                <td>${spec?.name || 'Unassigned'}</td>
                <td>₱${(appt.sales || 0).toFixed(2)}</td>
                <td class="status-${appt.status.toLowerCase()}">${appt.status}</td>
                <td>${appt.notes ? appt.notes.substring(0, 50) + '...' : 'No notes'}</td>
            `;
        tbody.appendChild(row);
    });
}

function openAppointmentModal(mode, index = null) {
    document.getElementById('appointmentTitle').textContent = mode === 'add' ? 'Add Appointment' : 'Edit Appointment';
    document.getElementById('apptId').value = index ?? '';
    document.getElementById('appointmentForm').reset();

    // Specialist dropdown
    const specSelect = document.getElementById('apptSpecialist');
    specSelect.innerHTML = '<option value="">Select Specialist</option>';
    employees.forEach(emp => {
        const opt = document.createElement('option');
        opt.value = emp.id || emp.name;
        opt.textContent = emp.name;
        specSelect.appendChild(opt);
    });

    if (mode === 'edit' && index !== null) {
        const appt = appointments[index];
        document.getElementById('apptCustomerName').value = appt.customerName;
        document.getElementById('apptCustomerEmail').value = appt.customerEmail;
        document.getElementById('apptCustomerPhone').value = appt.customerPhone;
        document.getElementById('apptCustomerAddress').value = appt.customerAddress;
        document.getElementById('apptService').value = appt.service;
        document.getElementById('apptDateTime').value = new Date(appt.datetime).toISOString().slice(0, 16);
        document.getElementById('apptSpecialist').value = appt.specialistId;
        document.getElementById('apptNotes').value = appt.notes || '';
    } else {
        document.getElementById('apptDateTime').value = new Date().toISOString().slice(0, 16);
    }

    document.getElementById('appointmentModal').style.display = 'flex';
}

function openStatusModal(index) {
    currentApptIndex = index;
    const appt = appointments[index];
    document.getElementById('statusId').value = index;
    document.getElementById('apptStatus').value = appt.status;
    document.getElementById('salesAmount').value = appt.sales || '';
    document.getElementById('statusNotes').value = appt.notes || '';
    document.getElementById('statusModal').style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Appointment Form Submit
document.getElementById('appointmentForm').addEventListener('submit', e => {
    e.preventDefault();
    const index = document.getElementById('apptId').value;
    const customerName = document.getElementById('apptCustomerName').value.trim();
    const customerEmail = document.getElementById('apptCustomerEmail').value.trim();
    const customerPhone = document.getElementById('apptCustomerPhone').value.trim();
    const customerAddress = document.getElementById('apptCustomerAddress').value.trim();
    const service = document.getElementById('apptService').value;
    const datetime = document.getElementById('apptDateTime').value;
    const specialistId = document.getElementById('apptSpecialist').value;
    const notes = document.getElementById('apptNotes').value.trim();

    if (!customerName || !customerEmail || !customerPhone || !customerAddress || !service || !datetime || !specialistId) {
        alert('Please fill all required fields.');
        return;
    }

    // Create/update customer
    let customer = customers.find(c => c.email.toLowerCase() === customerEmail.toLowerCase());
    if (!customer) {
        customer = {
            id: Date.now().toString(),
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: customerAddress,
            serviceHistory: ''
        };
        customers.push(customer);
    } else {
        customer.name = customerName;
        customer.phone = customerPhone;
        customer.address = customerAddress;
    }
    const customerId = customer.id;

    const appt = {
        customerId,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        service,
        datetime: new Date(datetime).toISOString(),
        specialistId,
        status: index !== '' ? appointments[index].status : 'Pending',
        notes,
        sales: index !== '' ? appointments[index].sales || 0 : 0
    };

    if (index === '') {
        appointments.push(appt);
        customer.serviceHistory += `\nNew Appointment: ${service} on ${new Date(datetime).toLocaleString()}`;
        alert('Appointment added successfully.');
    } else {
        appointments[index] = appt;
        alert('Appointment updated successfully.');
    }

    saveData();
    renderAppointments();
    renderExecution();
    renderReports();
    closeModal('appointmentModal');
});

// Status Update Form
document.getElementById('statusForm').addEventListener('submit', e => {
    e.preventDefault();
    const index = parseInt(document.getElementById('statusId').value);
    const newStatus = document.getElementById('apptStatus').value;
    const sales = parseFloat(document.getElementById('salesAmount').value) || 0;
    const notes = document.getElementById('statusNotes').value.trim();

    appointments[index].status = newStatus;
    appointments[index].sales = sales;
    appointments[index].notes = notes;

    if (newStatus === 'Completed') {
        const customer = customers.find(c => c.id === appointments[index].customerId);
        if (customer) {
            customer.serviceHistory += `\nCompleted: ${appointments[index].service} on ${new Date(appointments[index].datetime).toLocaleDateString()} - Sales: ₱${sales.toFixed(2)}`;
        }

        // Auto-deduct inventory for completed service
        const serviceInventoryMap = {
            'Eyelash': { productName: 'Eyelash Extensions', qty: 1 },
            'Nails': { productName: 'Nail Polish & Tools', qty: 1 },
            'Facial Treatment': { productName: 'Facial Products', qty: 1 },
            'Waxing Treatment': { productName: 'Waxing Supplies', qty: 1 },
            'Warts Removal': { productName: 'Removal Solution', qty: 1 },
            'Eyebrow Microblading': { productName: 'Microblading Pigment', qty: 1 }
        };

        const mapping = serviceInventoryMap[appointments[index].service];
        if (mapping) {
            const invItem = inventory.find(it => it.name.toLowerCase() === mapping.productName.toLowerCase());
            if (invItem) {
                if (invItem.quantity >= mapping.qty) {
                    invItem.quantity -= mapping.qty;

                    if (!invItem.usageHistory) invItem.usageHistory = [];
                    invItem.usageHistory.push({
                        timestamp: new Date().toISOString(),
                        quantity: mapping.qty,
                        reason: `Used in completed service: ${appointments[index].service} for ${appointments[index].customerName}`
                    });

                    saveInventory();
                } else {
                    alert(`Warning: Not enough stock for ${mapping.productName}. Service completed but inventory not deducted.`);
                }
            }
        }
    }

    saveData();
    renderAppointments();
    renderExecution();
    renderReports();
    closeModal('statusModal');
    alert('Status updated.');
});

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
showTab('appointments');

// Protect page
if (!localStorage.getItem('currentUser')) {
    window.location.href = 'login.html';
}