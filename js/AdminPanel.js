const API_BASE_URL = 'https://aid-bridge-backend.onrender.com/api';

// Function to handle dark mode toggle
const toggleDarkMode = () => {
  const body = document.body;
  const tables = document.querySelectorAll('.bg-white');
  const headers = document.querySelectorAll('.text-gray-900');
  const tableHeaders = document.querySelectorAll('.bg-gray-50');
  
  body.classList.toggle('dark');
  
  tables.forEach(table => {
    table.classList.toggle('dark-mode-card');
  });
  
  headers.forEach(header => {
    header.classList.toggle('dark-mode-text');
  });
  
  tableHeaders.forEach(header => {
    header.classList.toggle('dark-mode-header');
  });
  
  // Save dark mode preference
  const isDarkMode = body.classList.contains('dark');
  localStorage.setItem('darkMode', isDarkMode);
};

// Function to validate token
const validateToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return token;
};

// Function to show error messages
const showErrorMessage = (error) => {
  let message = 'An unexpected error occurred. Please try again.';
  
  if (error.response) {
    // Handle specific HTTP error responses
    switch (error.response.status) {
      case 401:
        message = 'Session expired. Please login again.';
        window.location.href = '/login.html';
        return;
      case 403:
        message = 'You do not have permission to perform this action.';
        break;
      case 404:
        message = 'User not found. They may have already been deleted.';
        break;
      case 500:
        message = 'Server error. Please try again later.';
        break;
      default:
        message = error.response.data?.message || message;
    }
  }
  
  // Create and show a custom error alert
  const errorDiv = document.createElement('div');
  errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded shadow-lg';
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  
  // Remove the error message after 5 seconds
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
};


// Function to respond to user query
const handleQueryResponse = async (queryId, email) => {
  const responseText = prompt('Enter your response:');
  if (!responseText) return;

  const token = localStorage.getItem('token');
  try {
    await axios.post(`${API_BASE_URL}/contact/${queryId}/respond`, {
      response: responseText,
      email: email
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Show success message
    alert('Response sent successfully!');
    // Refresh data
    fetchData();
  } catch (error) {
    console.error('Error sending response:', error);
    alert('Failed to send response. Please try again.');
  }
};

// Function to delete user
const handleDeleteUser = async (userId, userName) => {
  try {
    // First confirm the deletion
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    // Show loading state
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-4 rounded shadow-lg';
    loadingDiv.textContent = 'Deleting user...';
    document.body.appendChild(loadingDiv);
    
    // Validate token
    const token = validateToken();
    
    // Attempt to delete the user
    const response = await axios.delete(`${API_BASE_URL}/users/${userId}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Remove loading state
    loadingDiv.remove();
    
    // Show success message
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded shadow-lg';
    successDiv.textContent = 'User deleted successfully!';
    document.body.appendChild(successDiv);
    
    // Remove success message after 3 seconds
    setTimeout(() => {
      successDiv.remove();
    }, 3000);
    
    // Refresh the data
    await fetchData();
    
  } catch (error) {
    console.error('Error deleting user:', error);
    showErrorMessage(error);
  }
};

// Function to update dashboard elements with data
const updateDashboard = (data) => {
  const {
    totalDonations = 0,
    userQueries = [],
    registeredUsers = [],
    donationData = [],
  } = data;

  // Update Total Donations
  const totalDonationsElement = document.getElementById('total-donations');
  totalDonationsElement.textContent = `$${totalDonations.toLocaleString()}`;

  // Update User Queries Count
  const userQueriesElement = document.getElementById('user-queries');
  userQueriesElement.textContent = userQueries.length;

  // Update Registered Users Count
  const registeredUsersElement = document.getElementById('registered-users');
  registeredUsersElement.textContent = registeredUsers.length;

  // Populate tables and charts
  updateQueryTable(userQueries);
  updateUserTable(registeredUsers);
  updateDonationChart(donationData);
};

// Function to populate the queries table
const updateQueryTable = (queries = []) => {
  const queryTableBody = document.getElementById('query-table-body');
  queryTableBody.innerHTML = '';

  if (!Array.isArray(queries)) {
    console.error("userQueries is not an array:", queries);
    return;
  }

  queries.forEach((query) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap">${query.fullName}</td>
      <td class="px-6 py-4 whitespace-nowrap">${query.email}</td>
      <td class="px-6 py-4 whitespace-nowrap">${query.message}</td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          query.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
        }">${query.status}</span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <button onclick="handleQueryResponse('${query._id}', '${query.email}')" 
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Respond
        </button>
      </td>
    `;
    queryTableBody.appendChild(row);
  });
};

// Function to populate the users table
const updateUserTable = (users = []) => {
  const userTableBody = document.getElementById('user-table-body');
  userTableBody.innerHTML = '';

  if (!Array.isArray(users)) {
    console.error("registeredUsers is not an array:", users);
    return;
  }

  users.forEach((user) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap">${user.name}</td>
      <td class="px-6 py-4 whitespace-nowrap">${user.email}</td>
      <td class="px-6 py-4 whitespace-nowrap">
        <button 
          onclick="handleDeleteUser('${user._id}', '${user.name}')"
          class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Delete
        </button>
      </td>
    `;
    userTableBody.appendChild(row);
  });
};

// Function to populate the donation chart
const updateDonationChart = (data = []) => {
  // Process the donation data to group by month
  const monthlyDonations = data.reduce((acc, donation) => {
    const date = new Date(donation.createdAt);
    const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    if (!acc[monthYear]) {
      acc[monthYear] = 0;
    }
    acc[monthYear] += donation.product.amount || 0;
    return acc;
  }, {});

  // Convert to array format for Chart.js
  const chartData = {
    labels: Object.keys(monthlyDonations),
    datasets: [{
      label: 'Monthly Donations',
      data: Object.values(monthlyDonations),
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      tension: 0.4 // Adds smooth curves to the line
    }]
  };

  const ctx = document.getElementById('donation-chart').getContext('2d');
  
  // Destroy existing chart if it exists
  if (window.donationChart) {
    window.donationChart.destroy();
  }

  // Create new chart
  window.donationChart = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Monthly Donation Trends'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          }
        }
      }
    }
  });
};

// Function to fetch data from API
const fetchData = async () => {
  try {
    const token = validateToken();
    
    const [donationsResponse, queriesResponse, usersResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/donations/`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API_BASE_URL}/contact/`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    // Calculate total donations
    const totalDonations = donationsResponse.data.donations
      ? donationsResponse.data.donations.reduce((sum, donation) => 
          sum + (donation.product.amount || 0), 0)
      : 0;

    // Update dashboard with validated data
    updateDashboard({
      totalDonations,
      userQueries: Array.isArray(queriesResponse.data.data) 
        ? queriesResponse.data.data 
        : [],
      registeredUsers: Array.isArray(usersResponse.data.users) 
        ? usersResponse.data.users 
        : [],
      donationData: donationsResponse.data.donations || [],
    });
    
  } catch (error) {
    console.error('Error fetching data:', error);
    showErrorMessage(error);
  }
};

// Function to check if the user is an admin
const checkAdminAccess = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  if (!token || role !== 'admin') {
    alert("Access denied. Admins only.");
    window.location.href = '/login.html';
  }
};

// Display user role
const displayUserRole = () => {
  const role = localStorage.getItem('role');
  const roleDisplayElement = document.getElementById('role-display');
  if (roleDisplayElement) {
    roleDisplayElement.textContent = role ? role.toUpperCase() : 'Unknown';
  }
};

// Run on page load
document.addEventListener("DOMContentLoaded", () => {
  // Check for saved dark mode preference
  const savedDarkMode = localStorage.getItem('darkMode') === 'true';
  if (savedDarkMode) {
    document.body.classList.add('dark');
  }
  
  // Add event listener for dark mode toggle
  const darkModeToggle = document.getElementById('toggle-dark-mode');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
  }

  checkAdminAccess(); // Check admin access first
  displayUserRole(); // Display user role
  fetchData(); // Fetch dashboard data
  
  // Set up auto-refresh every 5 minutes
  setInterval(fetchData, 300000);
});