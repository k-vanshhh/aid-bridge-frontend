// public/js/contact.js
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const submitButton = document.getElementById('submitButton');
    const messageDiv = document.getElementById('messageDiv');

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Disable submit button while processing
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        // Get form data
        const formData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        };

        try {
            const response = await fetch('https://aid-bridge-backend.onrender.com/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Show success message
                messageDiv.className = 'success-message';
                messageDiv.textContent = data.message;
                // Clear form
                contactForm.reset();
            } else {
                // Show error message
                messageDiv.className = 'error-message';
                messageDiv.textContent = data.error || 'Something went wrong. Please try again.';
            }
        } catch (error) {
            // Show error message for network/server errors
            messageDiv.className = 'error-message';
            messageDiv.textContent = 'Unable to send message. Please try again later.';
        }

        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
    });
});