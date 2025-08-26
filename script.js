document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop(); // --- Authentication Logic ---

  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const logoutBtn = document.getElementById("logoutBtn");

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = e.target.signupEmail.value;
      const password = e.target.signupPassword.value;
      const users = JSON.parse(localStorage.getItem("users")) || {};
      if (users[email]) {
        alert("User with this email already exists.");
        return;
      }
      users[email] = {
        password: password,
      };
      localStorage.setItem("users", JSON.stringify(users));
      alert("Sign up successful! Please log in.");
      window.location.href = "index.html";
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = e.target.loginEmail.value;
      const password = e.target.loginPassword.value;
      const users = JSON.parse(localStorage.getItem("users")) || {};
      if (users[email] && users[email].password === password) {
        localStorage.setItem("currentUser", email);
        window.location.href = "dashboard.html";
      } else {
        alert("Invalid email or password.");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      window.location.href = "index.html";
    });
  } // --- Dashboard and Data Management Logic ---

  const currentUser = localStorage.getItem("currentUser");
  if (
    ["dashboard.html", "members.html", "payment.html"].includes(currentPage)
  ) {
    if (!currentUser) {
      window.location.href = "index.html";
      return;
    }

    const welcomeMessage = document.getElementById("welcomeMessage");
    if (welcomeMessage) {
      welcomeMessage.textContent = `Welcome, ${currentUser.split("@")[0]}!`;
    } // Highlight active sidebar link

    const navLinks = document.querySelectorAll(".sidebar nav ul li a");
    navLinks.forEach((link) => {
      if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
      }
    }); // Functions to save/get data from localStorage

    const saveData = (key, data) =>
      localStorage.setItem(key, JSON.stringify(data));
    const getData = (key) => JSON.parse(localStorage.getItem(key)) || []; // --- To-Do List Logic (Dashboard) ---

    const todoForm = document.getElementById("todoForm");
    const todoList = document.getElementById("todoList");
    let todos = getData("todos");

    const renderTodos = () => {
      if (!todoList) return;
      todoList.innerHTML = "";
      todos.forEach((todo, index) => {
        const li = document.createElement("li");
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
      todoForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const todoInput = document.getElementById("todoInput");
        todos.push(todoInput.value);
        saveData("todos", todos);
        todoInput.value = "";
        renderTodos();
      });
      renderTodos();
    } // --- Members Section Logic ---

    const memberForm = document.getElementById("memberForm");
    const membersList = document.getElementById("membersList");
    let members = getData("members");

    const renderMembers = () => {
      if (!membersList) return;
      membersList.innerHTML = "";
      members.forEach((member, index) => {
        const li = document.createElement("li");
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
      memberForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const memberIndex = document.getElementById("memberIndex").value;
        const newMember = {
          name: e.target.memberName.value,
          email: e.target.memberEmail.value,
          dob: e.target.memberDob.value,
          description: e.target.memberDescription.value,
        };

        if (memberIndex !== "") {
          // Update existing member
          members[memberIndex] = newMember;
        } else {
          // Add new member
          members.push(newMember);
        }

        saveData("members", members);
        e.target.reset();
        document.getElementById("memberIndex").value = "";
        document.getElementById("memberFormTitle").textContent =
          "Add New Member";
        document.getElementById("addMemberBtn").textContent = "Add Member";
        renderMembers();
      });
      renderMembers();
    } // --- Payments Section Logic ---

    const paymentForm = document.getElementById("paymentForm");
    const paymentHistory = document.getElementById("paymentHistory");
    let payments = getData("payments");

    const renderPayments = () => {
      if (!paymentHistory) return;
      paymentHistory.innerHTML = "";
      payments.forEach((payment, index) => {
        const li = document.createElement("li");
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
      paymentForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const paymentIndex = document.getElementById("paymentIndex").value;
        const newPayment = {
          mode: document.getElementById("paymentMode").value,
          amount: document.getElementById("paymentAmount").value,
          reference: document.getElementById("paymentReference").value,
        };

        if (paymentIndex !== "") {
          payments[paymentIndex] = newPayment;
        } else {
          payments.push(newPayment);
        }

        saveData("payments", payments);
        e.target.reset();
        document.getElementById("paymentIndex").value = "";
        document.getElementById("paymentFormTitle").textContent = "Add Payment";
        document.getElementById("addPaymentBtn").textContent = "Add Payment";
        renderPayments();
      });
      renderPayments();
    } // --- Edit/Delete Functions ---

    window.deleteItem = (key, index) => {
      if (confirm("Are you sure you want to delete this item?")) {
        const data = getData(key);
        data.splice(index, 1);
        saveData(key, data); // Re-render based on the key
        if (key === "todos") {
          todos = data;
          renderTodos();
        }
        if (key === "members") {
          members = data;
          renderMembers();
        }
        if (key === "payments") {
          payments = data;
          renderPayments();
        }
      }
    };

    window.editItem = (key, index) => {
      if (key === "members") {
        const member = members[index];
        document.getElementById("memberName").value = member.name;
        document.getElementById("memberEmail").value = member.email;
        document.getElementById("memberDob").value = member.dob;
        document.getElementById("memberDescription").value = member.description;
        document.getElementById("memberIndex").value = index;
        document.getElementById("memberFormTitle").textContent = "Edit Member";
        document.getElementById("addMemberBtn").textContent = "Update Member";
      } else if (key === "todos") {
        const todo = todos[index];
        const newText = prompt("Edit your task:", todo);
        if (newText !== null && newText.trim() !== "") {
          todos[index] = newText.trim();
          saveData("todos", todos);
          renderTodos();
        }
      } else if (key === "payments") {
        const payment = payments[index];
        document.getElementById("paymentMode").value = payment.mode;
        document.getElementById("paymentAmount").value = payment.amount;
        document.getElementById("paymentReference").value = payment.reference;
        document.getElementById("paymentIndex").value = index;
        document.getElementById("paymentFormTitle").textContent =
          "Edit Payment";
        document.getElementById("addPaymentBtn").textContent = "Update Payment";
      }
    };
  }

  // New sidebar toggle logic
  const sidebar = document.getElementById("sidebar");
  const openBtn = document.getElementById("openSidebarBtn");
  const closeBtn = document.getElementById("closeSidebarBtn");

  if (sidebar && openBtn && closeBtn) {
    openBtn.addEventListener("click", () => {
      sidebar.classList.add("open");
    });

    closeBtn.addEventListener("click", () => {
      sidebar.classList.remove("open");
    });
  }
});
