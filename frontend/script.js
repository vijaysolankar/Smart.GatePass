
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GLOBAL STATE & API CONFIG ---
    const API_URL = '/api';
    let state = {
        token: localStorage.getItem('token'),
        user: JSON.parse(localStorage.getItem('user')),
        currentRole: 'student',
    };

    // --- 2. DOM ELEMENTS ---
    const DOMElements = {
        // Sections
        loginSection: document.getElementById('login-section'),
        signupSection: document.getElementById('signup-section'),
        studentDashboard: document.getElementById('student-dashboard'),
        authorityDashboard: document.getElementById('authority-dashboard'),
        securityDashboard: document.getElementById('security-dashboard'),
        
        // Forms
        loginForm: document.getElementById('login-form'),
        signupForm: document.getElementById('signup-form'),
        gatepassForm: document.getElementById('gatepass-form'),
        studentProfileForm: document.getElementById('student-profile-form'),
        studentProfileSection: document.getElementById('student-profile-section'),

        // Login/Signup
        loginOptions: document.querySelectorAll('.login-option'),
        showSignupBtn: document.getElementById('show-signup'),
        showLoginBtn: document.getElementById('show-login'),

        // Student Dashboard
        studentUsername: document.getElementById('student-username'),
        studentLogoutBtn: document.getElementById('student-logout'),
        editInfoBtn: document.getElementById('edit-info-btn'),
        manualStudentIdInput: document.getElementById('manual-student-id'),
        fetchStudentBtn: document.getElementById('fetch-student-btn'),
        clearFormBtn: document.getElementById('clear-form-btn'),
        studentHistoryTable: document.getElementById('student-history').querySelector('tbody'),
        gatepassFormFields: {
            studentId: document.getElementById('student-id-hidden'),
            name: document.getElementById('student-name'),
            roll: document.getElementById('student-roll'),
            department: document.getElementById('student-department'),
            division: document.getElementById('student-division'),
            contact: document.getElementById('student-contact'),
            room: document.getElementById('student-room'),
            outTime: document.getElementById('out-time'),
            inTime: document.getElementById('in-time'),
            reason: document.getElementById('gatepass-reason'),
        },
        profileFormFields: {
            name: document.getElementById('profile-name'),
            roll: document.getElementById('profile-roll'),
            div: document.getElementById('profile-div'),
            contact: document.getElementById('profile-contact'),
            address: document.getElementById('profile-address'),
        },
        stats: {
            total: document.getElementById('total-passes'),
            approved: document.getElementById('approved-passes-stat'),
            pending: document.getElementById('pending-passes'),
            rejected: document.getElementById('rejected-passes'),
        },

        // Authority Dashboard
        authorityUsername: document.getElementById('authority-username'),
        authorityLogoutBtn: document.getElementById('authority-logout'),
        pendingRequestsTable: document.getElementById('pending-requests').querySelector('tbody'),
        processedRequestsTable: document.getElementById('processed-requests').querySelector('tbody'),

        // Security Dashboard
        securityUsername: document.getElementById('security-username'),
        securityLogoutBtn: document.getElementById('security-logout'),
        securityScanBtn: document.getElementById('security-scan-btn'),
        securityScannerContainer: document.getElementById('security-scanner-container'),
        securityScannerReader: document.getElementById('security-reader'),
        securityCloseScannerBtn: document.getElementById('security-close-scanner-btn'),
        approvedPassesTable: document.getElementById('approved-passes-table').querySelector('tbody'),
        entryExitLogTable: document.getElementById('entry-exit-log').querySelector('tbody'),

        // General
        alertContainer: document.getElementById('alert-container'),
        allDashboards: document.querySelectorAll('.dashboard'),
        allLogoutBtns: document.querySelectorAll('.logout-btn'),
        userAvatars: document.querySelectorAll('.user-avatar'),
    };

    // --- 3. API FUNCTIONS ---
    const api = {
        async request(endpoint, method = 'GET', body = null) {
            const headers = { 'Content-Type': 'application/json' };
            if (state.token) {
                headers['x-auth-token'] = state.token;
            }
            const config = { method, headers, body: body ? JSON.stringify(body) : null };
            try {
                const response = await fetch(`${API_URL}${endpoint}`, config);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.msg || `HTTP error! status: ${response.status}`);
                }
                if (response.status === 204) return null;
                return response.json();
            } catch (error) {
                console.error('API Request Error:', error);
                showAlert(error.message, 'danger');
                throw error;
            }
        },
        login: (username, password, role) => api.request('/auth/login', 'POST', { username, password, role }),
        signup: (username, email, password, role) => api.request('/auth/signup', 'POST', { username, email, password, role }),
        getStudentById: (idNo) => api.request(`/gatepass/fetchById/${idNo}`),
        applyGatepass: (data) => api.request('/gatepass/apply', 'POST', data),
        getStudentHistory: () => api.request('/gatepass/history'),
        getStudentProfile: () => api.request('/student/me'),
        updateStudentProfile: (data) => api.request('/student/me', 'PUT', data),
        getPendingRequests: () => api.request('/gatepass/pending'),
        getProcessedRequests: () => api.request('/gatepass/processed'),
        updateGatepassStatus: (id, status) => api.request(`/gatepass/updateStatus/${id}`, 'PUT', { status }),
        getApprovedPasses: () => api.request('/security/approved'),
        getEntryExitLog: () => api.request('/security/logbook'),
        recordLog: (gatepassId, type) => api.request('/security/logs', 'POST', { gatepassId, type }),
    };

    // --- 4. UI UPDATE & HELPER FUNCTIONS ---
    const ui = {
        showDashboard(role) {
            DOMElements.loginSection.classList.add('hidden');
            DOMElements.signupSection.classList.add('hidden');
            DOMElements.allDashboards.forEach(d => d.classList.add('hidden'));
            const dashboard = document.getElementById(`${role}-dashboard`);
            if (dashboard) {
                dashboard.classList.remove('hidden');
                const loader = `load${role.charAt(0).toUpperCase() + role.slice(1)}Dashboard`;
                if (window[loader]) window[loader]();
            }
        },
        resetUI() {
            DOMElements.loginSection.classList.remove('hidden');
            DOMElements.signupSection.classList.add('hidden');
            DOMElements.allDashboards.forEach(d => d.classList.add('hidden'));
            DOMElements.loginForm.reset();
            DOMElements.signupForm.reset();
        },
        fillStudentForm(student) {
            const { gatepassFormFields: f } = DOMElements;
            f.studentId.value = student._id;
            f.name.value = student.name;
            f.roll.value = student.rollNo;
            f.department.value = student.department;
            f.division.value = student.division;
            f.contact.value = student.contact;
            f.room.value = student.roomNo;
        },
        fillProfileForm(student) {
            const { profileFormFields: p } = DOMElements;
            p.name.value = student.name;
            p.roll.value = student.rollNo;
            p.div.value = student.division;
            p.contact.value = student.contact;
            p.address.value = student.address || '';
        },
        renderStudentHistory(passes) {
            DOMElements.studentHistoryTable.innerHTML = '';
            if (passes.length === 0) {
                DOMElements.studentHistoryTable.innerHTML = '<tr><td colspan="5">No gate pass history found.</td></tr>';
                return;
            }
            passes.forEach(pass => {
                const row = `
                    <tr>
                        <td>${pass.passNo}</td>
                        <td>${new Date(pass.createdAt).toLocaleDateString()}</td>
                        <td>${new Date(pass.outTime).toLocaleString()}</td>
                        <td>${pass.inTime ? new Date(pass.inTime).toLocaleString() : 'N/A'}</td>
                        <td><span class="status status-${pass.status}">${pass.status}</span></td>
                    </tr>
                `;
                DOMElements.studentHistoryTable.innerHTML += row;
            });
        },
        updateStudentStats(passes) {
            DOMElements.stats.total.textContent = passes.length;
            DOMElements.stats.approved.textContent = passes.filter(p => p.status === 'approved').length;
            DOMElements.stats.pending.textContent = passes.filter(p => p.status === 'pending').length;
            DOMElements.stats.rejected.textContent = passes.filter(p => p.status === 'rejected').length;
        },
        renderPendingRequests(requests) {
            DOMElements.pendingRequestsTable.innerHTML = '';
             if (requests.length === 0) {
                DOMElements.pendingRequestsTable.innerHTML = '<tr><td colspan="6">No pending requests.</td></tr>';
                return;
            }
            requests.forEach(req => {
                const row = `
                    <tr>
                        <td>${req.passNo}</td>
                        <td>${req.studentName}</td>
                        <td>${req.department}</td>
                        <td>${new Date(req.outTime).toLocaleString()}</td>
                        <td>${req.reason}</td>
                        <td class="action-buttons">
                            <button class="action-btn btn-success" data-id="${req._id}" data-action="approve">Approve</button>
                            <button class="action-btn btn-danger" data-id="${req._id}" data-action="reject">Reject</button>
                        </td>
                    </tr>
                `;
                DOMElements.pendingRequestsTable.innerHTML += row;
            });
        },
        renderProcessedRequests(requests) {
            DOMElements.processedRequestsTable.innerHTML = '';
             if (requests.length === 0) {
                DOMElements.processedRequestsTable.innerHTML = '<tr><td colspan="5">No processed requests found.</td></tr>';
                return;
            }
            requests.forEach(req => {
                const row = `
                    <tr>
                        <td>${req.passNo}</td>
                        <td>${req.studentName}</td>
                        <td>${req.department}</td>
                        <td><span class="status status-${req.status}">${req.status}</span></td>
                        <td>${new Date(req.actionDate).toLocaleDateString()}</td>
                    </tr>
                `;
                DOMElements.processedRequestsTable.innerHTML += row;
            });
        },
        renderApprovedPasses(passes) {
            DOMElements.approvedPassesTable.innerHTML = '';
            if (passes.length === 0) {
                DOMElements.approvedPassesTable.innerHTML = '<tr><td colspan="5">No approved passes for today.</td></tr>';
                return;
            }
            passes.forEach(pass => {
                const row = `
                    <tr>
                        <td>${pass.passNo}</td>
                        <td>${pass.studentName}</td>
                        <td>${pass.department}</td>
                        <td>${new Date(pass.outTime).toLocaleTimeString()}</td>
                        <td>${pass.inTime ? new Date(pass.inTime).toLocaleTimeString() : 'N/A'}</td>
                    </tr>
                `;
                DOMElements.approvedPassesTable.innerHTML += row;
            });
        },
        renderEntryExitLog(logs) {
            DOMElements.entryExitLogTable.innerHTML = '';
            if (logs.length === 0) {
                DOMElements.entryExitLogTable.innerHTML = '<tr><td colspan="5">No logs found.</td></tr>';
                return;
            }
            logs.forEach(log => {
                let status = 'Pending Exit';
                if(log.actualOut && !log.actualIn) status = 'Outside';
                if(log.actualOut && log.actualIn) status = 'Returned';
                const row = `
                    <tr>
                        <td>${log.gatepass.passNo}</td>
                        <td>${log.gatepass.student.name}</td>
                        <td>${log.actualOut ? new Date(log.actualOut).toLocaleString() : 'N/A'}</td>
                        <td>${log.actualIn ? new Date(log.actualIn).toLocaleString() : 'N/A'}</td>
                        <td><span class="status status-${status.toLowerCase()}">${status}</span></td>
                    </tr>
                `;
                DOMElements.entryExitLogTable.innerHTML += row;
            });
        }
    };

    function showAlert(message, type = 'success', duration = 3000) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
        DOMElements.alertContainer.appendChild(alert);
        setTimeout(() => {
            alert.classList.add('alert-exit');
            setTimeout(() => alert.remove(), 300);
        }, duration);
    }

    // --- 5. SCANNER LOGIC (Security Only) ---
    const securityScanner = new Html5Qrcode(DOMElements.securityScannerReader.id);

    const startScanner = (scanner, container, successCallback) => {
        if (scanner && scanner.isScanning) return;
        container.classList.remove('hidden');
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        scanner.start({ facingMode: "environment" }, config, successCallback, (error) => {});
    };

    const stopScanner = (scanner, container) => {
        if (scanner && scanner.isScanning) scanner.stop();
        container.classList.add('hidden');
    };

    const onSecurityScanSuccess = async (decodedText) => {
        stopScanner(securityScanner, DOMElements.securityScannerContainer);
        try {
            const gatepassId = decodedText;
            const log = await api.recordLog(gatepassId, 'exit');
            showAlert(`Gatepass ${log.gatepass.passNo} scanned. Exit recorded.`);
            loadSecurityDashboard();
        } catch (error) {}
    };

    // --- 6. EVENT HANDLERS & LOGIC ---
    async function handleLogin(e) {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        try {
            const { username, password } = DOMElements.loginForm;
            const role = state.currentRole;
            const data = await api.login(username.value, password.value, role);
            state.token = data.token;
            state.user = data.user;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            DOMElements.userAvatars.forEach(avatar => avatar.textContent = state.user.username.charAt(0).toUpperCase());
            document.getElementById(`${state.user.role}-username`).textContent = state.user.username.toUpperCase();
            ui.showDashboard(state.user.role);
        } catch (error) {
        } finally {
            submitBtn.disabled = false;
        }
    }

    async function handleSignup(e) {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        try {
            const { 'signup-username': username, 'signup-email': email, 'signup-password': password, 'signup-role': role } = DOMElements.signupForm;
            await api.signup(username.value, email.value, password.value, role.value);
            showAlert('Signup successful! Please login.');
            DOMElements.signupSection.classList.add('hidden');
            DOMElements.loginSection.classList.remove('hidden');
        } catch (error) {
        } finally {
            submitBtn.disabled = false;
        }
    }

    function handleLogout() {
        state.token = null;
        state.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        ui.resetUI();
    }

    async function handleGatepassApply(e) {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        try {
            const f = DOMElements.gatepassFormFields;
            const data = {
                studentId: f.studentId.value,
                studentName: f.name.value,
                rollNo: f.roll.value,
                department: f.department.value,
                outTime: f.outTime.value,
                inTime: f.inTime.value,
                reason: f.reason.value,
            };
            if (!data.studentName || !data.rollNo || !data.department) {
                showAlert('Please fill in at least your Name, Roll No, and Department.', 'warning');
                return;
            }
            await api.applyGatepass(data);
            showAlert('Gatepass request submitted successfully!');
            DOMElements.gatepassForm.reset();
            loadStudentDashboard();
        } catch (error) {
        } finally {
            submitBtn.disabled = false;
        }
    }

    async function handleProfileUpdate(e) {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        try {
            const p = DOMElements.profileFormFields;
            const data = {
                name: p.name.value,
                rollNo: p.roll.value,
                division: p.div.value,
                contact: p.contact.value,
                address: p.address.value,
                // Department is not in this form, so we don't update it here
            };
            const updatedProfile = await api.updateStudentProfile(data);
            showAlert('Profile updated successfully!');
            // Re-fill the gate pass form with the new details
            ui.fillStudentForm(updatedProfile);
        } catch (error) {
        } finally {
            submitBtn.disabled = false;
        }
    }

    async function handleAuthorityAction(e) {
        if (e.target.matches('.action-btn')) {
            const { id, action } = e.target.dataset;
            if (!confirm(`Are you sure you want to ${action} this request?`)) return;
            try {
                // FIX: The backend enum expects 'approved' or 'rejected'
                const status = action === 'approve' ? 'approved' : 'rejected';
                await api.updateGatepassStatus(id, status);
                showAlert(`Request has been ${status}.`);
                loadAuthorityDashboard();
            } catch (error) {}
        }
    }

    async function handleManualFetch() {
        const idNo = DOMElements.manualStudentIdInput.value.trim();
        if (!idNo) {
            showAlert('Please enter a Student ID.', 'warning');
            return;
        }
        try {
            const student = await api.getStudentById(idNo);
            ui.fillStudentForm(student);
            showAlert(`Student ID ${idNo} found and data filled.`);
        } catch (error) {
            DOMElements.gatepassForm.reset();
        }
    }

    // --- DASHBOARD LOADERS ---
    window.loadStudentDashboard = async function() {
        try {
            // Fetch profile first, then history
            const profile = await api.getStudentProfile();
            ui.fillProfileForm(profile);
            ui.fillStudentForm(profile); // Auto-fill gate pass form

            const passes = await api.getStudentHistory();
            ui.renderStudentHistory(passes);
            ui.updateStudentStats(passes);
        } catch (error) {}
    }
    window.loadAuthorityDashboard = async function() {
        try {
            const [pending, processed] = await Promise.all([api.getPendingRequests(), api.getProcessedRequests()]);
            ui.renderPendingRequests(pending);
            ui.renderProcessedRequests(processed);
        } catch (error) {}
    }
    window.loadSecurityDashboard = async function() {
        try {
            const [approved, logs] = await Promise.all([api.getApprovedPasses(), api.getEntryExitLog()]);
            ui.renderApprovedPasses(approved);
            ui.renderEntryExitLog(logs);
        } catch (error) {}
    }

    // --- INITIALIZATION ---
    function init() {
        // Initialize Flatpickr
        flatpickr("#out-time", { enableTime: true, dateFormat: "Y-m-d H:i" });
        flatpickr("#in-time", { enableTime: true, dateFormat: "Y-m-d H:i" });

        // Event Listeners
        DOMElements.loginOptions.forEach(option => {
            option.addEventListener('click', () => {
                DOMElements.loginOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                state.currentRole = option.dataset.role;
            });
        });

        DOMElements.loginForm.addEventListener('submit', handleLogin);
        DOMElements.signupForm.addEventListener('submit', handleSignup);
        DOMElements.gatepassForm.addEventListener('submit', handleGatepassApply);
        DOMElements.studentProfileForm.addEventListener('submit', handleProfileUpdate);
        
        DOMElements.editInfoBtn.addEventListener('click', () => {
            DOMElements.studentProfileSection.classList.toggle('hidden');
        });

        DOMElements.showSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            DOMElements.loginSection.classList.add('hidden');
            DOMElements.signupSection.classList.remove('hidden');
        });

        DOMElements.showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            DOMElements.signupSection.classList.add('hidden');
            DOMElements.loginSection.classList.remove('hidden');
        });

        DOMElements.allLogoutBtns.forEach(btn => btn.addEventListener('click', handleLogout));
        DOMElements.fetchStudentBtn.addEventListener('click', handleManualFetch);
        DOMElements.clearFormBtn.addEventListener('click', () => DOMElements.gatepassForm.reset());
        DOMElements.pendingRequestsTable.addEventListener('click', handleAuthorityAction);
        DOMElements.securityScanBtn.addEventListener('click', () => startScanner(securityScanner, DOMElements.securityScannerContainer, onSecurityScanSuccess));
        DOMElements.securityCloseScannerBtn.addEventListener('click', () => stopScanner(securityScanner, DOMElements.securityScannerContainer));
        
        // Initial Load
        if (state.token && state.user) {
            DOMElements.userAvatars.forEach(avatar => avatar.textContent = state.user.username.charAt(0).toUpperCase());
            document.getElementById(`${state.user.role}-username`).textContent = state.user.username.toUpperCase();
            ui.showDashboard(state.user.role);
        }
    }

    init();
});
