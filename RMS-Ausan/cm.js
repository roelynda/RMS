let customers = JSON.parse(localStorage.getItem('customers')) || [];
let employees = JSON.parse(localStorage.getItem('employees')) || [];
let currentCustomerId = null;

function saveCustomers() {
    localStorage.setItem('customers', JSON.stringify(customers));
}

function renderCustomers(query = '') {
    const tbody = document.getElementById('customerTable');
    const noResults = document.getElementById('noResults');
    tbody.innerHTML = '';
    noResults.style.display = 'none';

    const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(query.toLowerCase()) ||
        customer.email.toLowerCase().includes(query.toLowerCase()) ||
        customer.phone.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
        noResults.style.display = 'block';
        return;
    }

    filtered.forEach((customer, index) => {
        const assignedEmp = employees.find(emp => (emp.id || emp.name) === customer.assignedEmployeeId)?.name || 'None';

        const row = document.createElement('tr');
        row.innerHTML = `
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td>${customer.address}</td>
                <td>${assignedEmp}</td>
                <td>
                    <button class="btn btn-warning" style="font-size:13px; padding:6px 12px;" onclick="openViewModal(${index})">
                        View
                    </button>
                </td>
            `;
        tbody.appendChild(row);
    });
}

function filterCustomers() {
    const query = document.getElementById('searchInput').value;
    renderCustomers(query);
}

function populateEmployeeSelect(selectId) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">None</option>';
    employees.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.id || emp.name;
        option.textContent = emp.name;
        select.appendChild(option);
    });
}

function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Add New Customer';
    document.getElementById('customerId').value = '';
    document.getElementById('customerForm').reset();
    populateEmployeeSelect('assignedEmployee');
    document.getElementById('addEditModal').style.display = 'flex';
}

function openEditModal(index) {
    const customer = customers[index];
    document.getElementById('modalTitle').textContent = 'Edit Customer';
    document.getElementById('customerId').value = index;
    document.getElementById('name').value = customer.name;
    document.getElementById('email').value = customer.email;
    document.getElementById('phone').value = customer.phone;
    document.getElementById('address').value = customer.address;
    populateEmployeeSelect('assignedEmployee');
    document.getElementById('assignedEmployee').value = customer.assignedEmployeeId || '';
    document.getElementById('addEditModal').style.display = 'flex';
}

function openViewModal(index) {
    const customer = customers[index];
    currentCustomerId = index;
    document.getElementById('detailName').textContent = customer.name;
    document.getElementById('detailEmail').textContent = customer.email;
    document.getElementById('detailPhone').textContent = customer.phone;
    document.getElementById('detailAddress').textContent = customer.address;
    const assignedEmp = employees.find(emp => (emp.id || emp.name) === customer.assignedEmployeeId)?.name || 'None';
    document.getElementById('detailAssignedEmp').textContent = assignedEmp;
    document.getElementById('purchaseHistory').value = customer.purchaseHistory || '';
    document.getElementById('serviceHistory').value = customer.serviceHistory || '';
    document.getElementById('notes').value = customer.notes || '';
    document.getElementById('viewModal').style.display = 'flex';
}

function editCustomerFromDetails() {
    closeModal('viewModal');
    openEditModal(currentCustomerId);
}

function openDeleteModal() {
    document.getElementById('deleteId').value = currentCustomerId;
    document.getElementById('deleteModal').style.display = 'flex';
}

function confirmDelete() {
    const index = parseInt(document.getElementById('deleteId').value);
    customers.splice(index, 1);
    saveCustomers();
    renderCustomers(document.getElementById('searchInput')?.value || '');
    closeModal('deleteModal');
    closeModal('viewModal');
    alert('Customer deleted.');
}

function saveDetails() {
    const customer = customers[currentCustomerId];
    customer.purchaseHistory = document.getElementById('purchaseHistory').value;
    customer.serviceHistory = document.getElementById('serviceHistory').value;
    customer.notes = document.getElementById('notes').value;
    saveCustomers();
    alert('Details updated.');
    closeModal('viewModal');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Customer Form Submit
document.getElementById('customerForm').addEventListener('submit', e => {
    e.preventDefault();
    const index = document.getElementById('customerId').value;
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const assignedEmpId = document.getElementById('assignedEmployee').value || null;

    if (!name || !isValidEmail(email) || !phone || !address) {
        alert('Please fill all fields correctly.');
        return;
    }

    const customer = {
        name, email, phone, address,
        assignedEmployeeId: assignedEmpId,
        purchaseHistory: index !== '' ? customers[index].purchaseHistory || '' : '',
        serviceHistory: index !== '' ? customers[index].serviceHistory || '' : '',
        notes: index !== '' ? customers[index].notes || '' : ''
    };

    if (index === '') {
        customer.id = Date.now().toString();
        customers.push(customer);
        alert('Customer added successfully.');
    } else {
        customer.id = customers[index].id;
        customers[index] = customer;
        alert('Customer updated successfully.');
    }

    saveCustomers();
    renderCustomers(document.getElementById('searchInput')?.value || '');
    closeModal('addEditModal');
});

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

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

// Handle select floating labels
document.querySelectorAll('select').forEach(select => {
    function updateLabel() {
        select.classList.toggle('has-value', select.value !== '');
    }
    select.addEventListener('change', updateLabel);
    updateLabel();
});

// Init
renderCustomers();

if (!localStorage.getItem('currentUser')) {
    window.location.href = 'login.html';
}