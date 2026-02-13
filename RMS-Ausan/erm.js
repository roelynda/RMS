let employees = JSON.parse(localStorage.getItem('employees')) || [];
    let roles = JSON.parse(localStorage.getItem('roles')) || [];
    let currentEmployeeId = null;

    function saveData() {
        localStorage.setItem('employees', JSON.stringify(employees));
        localStorage.setItem('roles', JSON.stringify(roles));
    }

    function showTab(tabId) {
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.querySelector(`.tab[onclick="showTab('${tabId}')"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');
        if (tabId === 'employees') renderEmployees();
        if (tabId === 'roles') renderRoles();
    }

    function renderEmployees() {
        const tbody = document.getElementById('employeeTable');
        tbody.innerHTML = '';
        employees.filter(emp => emp.active).forEach((emp, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${emp.name}</td>
                <td>${emp.email}</td>
                <td>${emp.phone}</td>
                <td>${emp.roles.map(r => r.name).join(', ') || 'None'}</td>
                <td>${emp.active ? 'Active' : 'Inactive'}</td>
                <td>
                    <button class="btn btn-warning" style="font-size:13px; padding:6px 12px;" onclick="openViewEmployeeModal(${index})">
                        View
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    function renderRoles() {
        const tbody = document.getElementById('roleTable');
        tbody.innerHTML = '';
        roles.forEach((role, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${role.name}</td>
                <td>${role.permissions}</td>
                <td>
                    <button class="btn btn-warning" style="font-size:13px; padding:6px 12px; margin-right:6px;" onclick="openEditRoleModal(${index})">
                        Edit
                    </button>
                    <button class="btn btn-danger" style="font-size:13px; padding:6px 12px;" onclick="openDeleteRoleModal(${index})">
                        Delete
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    function openAddEmployeeModal() {
        document.getElementById('employeeModalTitle').textContent = 'Add New Employee';
        document.getElementById('employeeId').value = '';
        document.getElementById('employeeForm').reset();
        document.getElementById('addEditEmployeeModal').style.display = 'flex';
    }

    function openEditEmployeeModal(index) {
        const emp = employees[index];
        document.getElementById('employeeModalTitle').textContent = 'Edit Employee';
        document.getElementById('employeeId').value = index;
        document.getElementById('empName').value = emp.name;
        document.getElementById('empEmail').value = emp.email;
        document.getElementById('empPhone').value = emp.phone;
        document.getElementById('addEditEmployeeModal').style.display = 'flex';
    }

    function openViewEmployeeModal(index) {
        const emp = employees[index];
        currentEmployeeId = index;
        document.getElementById('detailEmpName').textContent = emp.name;
        document.getElementById('detailEmpEmail').textContent = emp.email;
        document.getElementById('detailEmpPhone').textContent = emp.phone;
        document.getElementById('detailEmpStatus').textContent = emp.active ? 'Active' : 'Inactive';

        const rolesList = document.getElementById('assignedRoles');
        rolesList.innerHTML = '';
        emp.roles.forEach(role => {
            const li = document.createElement('li');
            li.textContent = `${role.name}: ${role.permissions}`;
            rolesList.appendChild(li);
        });

        document.getElementById('viewEmployeeModal').style.display = 'flex';
    }

    function editEmployeeFromProfile() {
        closeModal('viewEmployeeModal');
        openEditEmployeeModal(currentEmployeeId);
    }

    function openAssignRoleModal() {
        const select = document.getElementById('roleSelect');
        select.innerHTML = '<option value="">Select Role</option>';
        roles.forEach((role, i) => {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = role.name;
            select.appendChild(option);
        });
        document.getElementById('assignRoleModal').style.display = 'flex';
    }

    function openDeactivateModal() {
        document.getElementById('deactivateModal').style.display = 'flex';
    }

    function confirmDeactivate() {
        employees[currentEmployeeId].active = false;
        saveData();
        renderEmployees();
        closeModal('deactivateModal');
        closeModal('viewEmployeeModal');
        alert('Employee deactivated.');
    }

    function openAddRoleModal() {
        document.getElementById('roleModalTitle').textContent = 'Add New Role';
        document.getElementById('roleId').value = '';
        document.getElementById('roleForm').reset();
        document.getElementById('addEditRoleModal').style.display = 'flex';
    }

    function openEditRoleModal(index) {
        const role = roles[index];
        document.getElementById('roleModalTitle').textContent = 'Edit Role';
        document.getElementById('roleId').value = index;
        document.getElementById('roleName').value = role.name;
        document.getElementById('permissions').value = role.permissions;
        document.getElementById('addEditRoleModal').style.display = 'flex';
    }

    function openDeleteRoleModal(index) {
        document.getElementById('deleteRoleId').value = index;
        document.getElementById('deleteRoleModal').style.display = 'flex';
    }

    function confirmDeleteRole() {
        const index = parseInt(document.getElementById('deleteRoleId').value);
        const roleName = roles[index].name;
        employees.forEach(emp => {
            emp.roles = emp.roles.filter(r => r.name !== roleName);
        });
        roles.splice(index, 1);
        saveData();
        renderRoles();
        closeModal('deleteRoleModal');
        alert('Role deleted.');
    }

    function closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    // Employee Form Submit
    document.getElementById('employeeForm').addEventListener('submit', e => {
        e.preventDefault();
        const index = document.getElementById('employeeId').value;
        const name = document.getElementById('empName').value.trim();
        const email = document.getElementById('empEmail').value.trim();
        const phone = document.getElementById('empPhone').value.trim();

        if (!name || !isValidEmail(email) || !phone) {
            alert('Please fill all fields correctly.');
            return;
        }

        const employee = {
            name, email, phone,
            roles: index !== '' ? employees[index].roles : [],
            active: index !== '' ? employees[index].active : true
        };

        if (index === '') {
            employees.push(employee);
            alert('Employee added.');
        } else {
            employees[index] = employee;
            alert('Employee updated.');
        }

        saveData();
        renderEmployees();
        closeModal('addEditEmployeeModal');
    });

    // Assign Role
    document.getElementById('assignRoleForm').addEventListener('submit', e => {
        e.preventDefault();
        const roleIndex = document.getElementById('roleSelect').value;
        if (roleIndex === '') return;

        const role = roles[roleIndex];
        const emp = employees[currentEmployeeId];
        if (!emp.roles.some(r => r.name === role.name)) {
            emp.roles.push({ name: role.name, permissions: role.permissions });
            saveData();
            alert('Role assigned.');
            openViewEmployeeModal(currentEmployeeId);
        } else {
            alert('Role already assigned.');
        }
        closeModal('assignRoleModal');
    });

    // Role Form Submit
    document.getElementById('roleForm').addEventListener('submit', e => {
        e.preventDefault();
        const index = document.getElementById('roleId').value;
        const name = document.getElementById('roleName').value.trim();
        const perms = document.getElementById('permissions').value.trim();

        if (!name || !perms) {
            alert('Please fill all fields.');
            return;
        }

        const role = { name, permissions: perms };

        if (index === '') {
            roles.push(role);
            alert('Role added.');
        } else {
            const oldName = roles[index].name;
            if (oldName !== name) {
                employees.forEach(emp => {
                    emp.roles.forEach(r => { if (r.name === oldName) r.name = name; });
                });
            }
            roles[index] = role;
            alert('Role updated.');
        }

        saveData();
        renderRoles();
        closeModal('addEditRoleModal');
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

    // Init
    showTab('employees');

    // Protect page
    if (!localStorage.getItem('currentUser')) {
        window.location.href = 'login.html';
    }