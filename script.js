document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();

    // --- Authentication Logic ---
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.signupEmail.value;
            const password = e.target.signupPassword.value;
            const users = JSON.parse(localStorage.getItem('users')) || {};
            if (users[email]) {
                alert('User with this email already exists.');
                return;
            }
            users[email] = { password: password };
            localStorage.setItem('users', JSON.stringify(users));
            alert('Sign up successful! Please log in.');
            window.location.href = 'index.html';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.loginEmail.value;
            const password = e.target.loginPassword.value;
            const users = JSON.parse(localStorage.getItem('users')) || {};
            if (users[email] && users[email].password === password) {
                localStorage.setItem('currentUser', email);
                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid email or password.');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }

    // --- Dashboard and Data Management Logic ---
    const currentUser = localStorage.getItem('currentUser');
    if (['dashboard.html', 'members.html', 'payments.html'].includes(currentPage)) {
        if (!currentUser) {
            window.location.href = 'index.html'; 
            return;
        }

        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome, ${currentUser.split('@')[0]}!`;
        }

        // Functions to save/get data from localStorage
        const saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));
        const getData = (key) => JSON.parse(localStorage.getItem(key)) || [];

        // --- To-Do List Logic (Dashboard) ---
        const todoForm = document.getElementById('todoForm');
        const todoList = document.getElementById('todoList');
        let todos = getData('todos');

        const renderTodos = () => {
            todoList.innerHTML = '';
            todos.forEach((todo, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${todo}</span>
                    <div class="actions">
                        <button onclick="editItem('todos', ${index})">Edit</button>
                        <button onclick="deleteItem('todos', ${index})">Delete</button>
                    </div>
                `;
                todoList.appendChild(li);
            });
        };

        if (todoForm) {
            todoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const todoInput = document.getElementById('todoInput');
                todos.push(todoInput.value);
                saveData('todos', todos);
                todoInput.value = '';
                renderTodos();
            });
            renderTodos();
        }

        // --- Members Section Logic ---
        const memberForm = document.getElementById('memberForm');
        const membersList = document.getElementById('membersList');
        let members = getData('members');

        const renderMembers = () => {
            membersList.innerHTML = '';
            members.forEach((member, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div>
                        <p><strong>Name:</strong> ${member.name}</p>
                        <p><strong>Email:</strong> ${member.email}</p>
                        <p><strong>DOB:</strong> ${member.dob}</p>
                        <p><strong>Description:</strong> ${member.description}</p>
                    </div>
                    <div class="actions">
                        <button onclick="editItem('members', ${index})">Edit</button>
                        <button onclick="deleteItem('members', ${index})">Delete</button>
                    </div>
                `;
                membersList.appendChild(li);
            });
        };

        if (memberForm) {
            memberForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const newMember = {
                    name: e.target.memberName.value,
                    email: e.target.memberEmail.value,
                    dob: e.target.memberDob.value,
                    description: e.target.memberDescription.value
                };
                members.push(newMember);
                saveData('members', members);
                e.target.reset();
                renderMembers();
            });
            renderMembers();
        }

        // --- Payments Section Logic ---
        const paymentForm = document.getElementById('paymentForm');
        const paymentHistory = document.getElementById('paymentHistory');
        let payments = getData('payments');

        const renderPayments = () => {
            paymentHistory.innerHTML = '';
            payments.forEach((payment, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div>
                        <p><strong>Mode:</strong> ${payment.mode}</p>
                        <p><strong>Amount:</strong> $${payment.amount}</p>
                        <p><strong>Reference:</strong> ${payment.reference}</p>
                    </div>
                    <div class="actions">
                        <button onclick="editItem('payments', ${index})">Edit</button>
                        <button onclick="deleteItem('payments', ${index})">Delete</button>
                    </div>
                `;
                paymentHistory.appendChild(li);
            });
        };

        if (paymentForm) {
            paymentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const newPayment = {
                    mode: e.target.paymentMode.value,
                    amount: e.target.paymentAmount.value,
                    reference: e.target.paymentReference.value
                };
                payments.push(newPayment);
                saveData('payments', payments);
                e.target.reset();
                renderPayments();
            });
            renderPayments();
        }

        // ---  Edit/Delete Functions ---
        window.deleteItem = (key, index) => {
            if (confirm('Are you sure you want to delete this item?')) {
                const data = getData(key);
                data.splice(index, 1);
                saveData(key, data);
                // Re-do based on the key
                if (key === 'todos') renderTodos();
                if (key === 'members') renderMembers();
                if (key === 'payments') renderPayments();
            }
        };

        window.editItem = (key, index) => {
            const data = getData(key);
            const item = data[index];
            const newValue = prompt(`Edit item:`, JSON.stringify(item));
            if (newValue !== null && newValue !== "") {
                try {
                    data[index] = JSON.parse(newValue);
                    saveData(key, data);
                    // Re-do
                    if (key === 'todos') renderTodos();
                    if (key === 'members') renderMembers();
                    if (key === 'payments') renderPayments();
                } catch (e) {
                    alert('Invalid JSON format. Please try again.');
                }
            }
        };
    }
});