//const API_URL = 'https://aid-bridge-backend.onrender.com/api';

// Check if user is already logged in and has access to the requested page
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const role = localStorage.getItem('role'); // Retrieve the user's role

    if (token && user && role) {
        // Admin-specific page access
        if (window.location.pathname.includes('admin.html') && role !== 'admin') {
            //alert("Access restricted to admins only.");
            window.location.href = '/index.html'; // Redirect non-admins away from the admin page
            //return;
        }

        // // Donor-specific dashboard access
        // if (window.location.pathname.includes('dashboard.html') && role !== 'donor') {
        //     alert("Access restricted to donors only.");
        //     window.location.href = '/index.html'; // Redirect non-donors away from donor-specific dashboard
        //     return;
        // }

        // If a user is on the index page and already authenticated, redirect to their respective dashboard
        if (window.location.pathname === '/index.html') {
            window.location.href = role === 'admin' ? '/pages/admin.html' : '/pages/dashboard.html';
        }

    } else if (!token && (window.location.pathname.includes('dashboard.html') || window.location.pathname.includes('admin.html'))) {
        // Redirect to login if not authenticated and trying to access protected pages
        window.location.href = '/index.html';
    }
}

// Run auth check on page load
document.addEventListener('DOMContentLoaded', checkAuth);

// Handle login form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('error-message');
        
        try {
            const response = await fetch(`https://aid-bridge-backend.onrender.com/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                })
            });

            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('role', data.user.role); // Store the user's role

                // Redirect based on role
                if (data.user.role === 'admin') {
                    window.location.href = '/pages/admin.html'; // Admin dashboard
                } else if (data.user.role === 'donor') {
                    window.location.href = '/pages/dashboard.html'; // Donor dashboard
                }
            } else {
                errorDiv.textContent = data.message || 'Login failed';
                errorDiv.classList.remove('hidden');
            }
        } catch (error) {
            errorDiv.textContent = 'An error occurred. Please try again.';
            errorDiv.classList.remove('hidden');
        }
    });
}

// Handle registration form
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('error-message');
        
        try {
            const response = await fetch(`https://aid-bridge-backend.onrender.com/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                })
            });

            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('role', data.user.role); // Store the user's role

                // Redirect based on role
                if (data.user.role === 'admin') {
                    window.location.href = '/pages/admin.html'; // Admin dashboard
                } else {
                    window.location.href = '/pages/dashboard.html'; // Donor dashboard
                }
            } else {
                errorDiv.textContent = data.message || 'Registration failed';
                errorDiv.classList.remove('hidden');
            }
        } catch (error) {
            errorDiv.textContent = 'An error occurred. Please try again.';
            errorDiv.classList.remove('hidden');
        }
    });
}

// Handle logout
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            console.log("Logout button clicked"); // Debugging line
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('role'); // Clear the role as well
            window.location.href = '../index.html';
        });
    } else {
        console.error("Logout button not found");
    }
});

 