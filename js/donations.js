// js/donations.js
const API_URL = 'https://aid-bridge-backend.onrender.com/api';

// Format date to readable string
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format amount to currency (Indian Rupee)
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}


// Create donation card HTML
function createDonationCard(donation) {
    return `
        <div class="donation-card">
            <div class="flex justify-between items-start">
                <div>
                    <span class="category-badge ${donation.product.name}">${donation.product.name}</span>
                    <p class="mt-2 text-lg font-semibold">${formatCurrency(donation.product.amount)}</p>
                    ${donation.product.description ? `<p class="mt-1 text-gray-600">${donation.product.description}</p>` : ''}
                </div>
                <div class="text-right">
                    <p class="text-sm text-gray-500">${formatDate(donation.createdAt)}</p>
                    <p class="text-sm text-gray-600">Status: ${donation.paymentStatus}</p>
                </div>
            </div>
        </div>
    `;
}

// Load donations
async function loadDonations() {
    const token = localStorage.getItem('token');
    // console.log(token); 
    const donationsList = document.getElementById('donationsList');
    const totalDonatedElement = document.querySelector('.total-donated'); // Element for total donated amount
    const donationCountElement = document.querySelector('.donation-count'); // Element for donation count

    try {
        const response = await fetch(`${API_URL}/donations/my-donations`, {
            headers: {
                'Authorization': `Bearer ${token}`
                
            }
        });

        const data = await response.json();
        
        if (data.success) {
            // Calculate the total amount and count of donations
            let totalAmount = data.donations.reduce((sum, donation) => sum + donation.product.amount, 0);
            let donationCount = data.donations.length;

            // Update total donated amount
            if (totalDonatedElement) {
                totalDonatedElement.textContent = formatCurrency(totalAmount);
            }

            // Update donation count
            if (donationCountElement) {
                donationCountElement.textContent = donationCount;
            }

            // Populate donations list with the user's donations
            donationsList.innerHTML = donationCount > 0 ? 
                data.donations.map(createDonationCard).join('') :
                '<p class="text-gray-500">No donations yet</p>';
        } else {
            donationsList.innerHTML = '<p class="text-red-500">Failed to load donations</p>';
        }
    } catch (error) {
        donationsList.innerHTML = '<p class="text-red-500">Error loading donations</p>';
    }
}


// Handle donation form submission
const donationForm = document.getElementById('donationForm');
if (donationForm) {
    donationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        // Get form values and print them to the console
        const name = document.getElementById('name').value;
        
        console.log("Product Name:", name);
        const amount = document.getElementById('amount').value;
        console.log("Amount:", amount);
        const category = document.getElementById('category').value;
        console.log("Category:", category);
        const description = document.getElementById('description').value;
        console.log("Description:", description);
        
        try {
            const response = await fetch(`${API_URL}/donations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    product: {
                        name: name,
                        amount: amount,
                        category: category,
                        description: description
                    },
                })
            });

            const data = await response.json();
            
            if (data.success) {
                donationForm.reset();
                loadDonations(); // Reload donations list
            } else {
                alert('Failed to create donation. Please try again.');
            }
        } catch (error) {
            alert(error);
        }
    });
}

// Load donations on pae load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard')) {
        loadDonations();
    }
});


// Add this JavaScript to your existing scripts
function openPaymentModal() {
    const modal = document.getElementById('paymentModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
}

function handleCheckout() {
    // Add your payment processing logic here
    alert('Processing payment...');
    closePaymentModal();
}

// Close modal when clicking outside the payment container
document.getElementById('paymentModal').addEventListener('click', function(event) {
    if (event.target === this) {
        closePaymentModal();
    }
});

// Add this to your existing donation button
document.querySelector('.donation-form button').addEventListener('click', openPaymentModal);