// Add this to a file named auth.js
// Include this script in the <head> section of EVERY page

(function() {
    // Check if user is already authenticated
    const isAuthenticated = sessionStorage.getItem('authenticated');
    
    if (!isAuthenticated) {
        // Wait for DOM to be fully loaded
        document.addEventListener('DOMContentLoaded', function() {
            // Create overlay
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
            overlay.style.zIndex = '1000';
            overlay.style.display = 'flex';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            overlay.style.flexDirection = 'column';
            
            // Create password form
            const passwordForm = document.createElement('div');
            passwordForm.innerHTML = `
                <h2 style="color: white; margin-bottom: 20px;">Enter Access Code</h2>
                <input type="password" id="password-input" style="padding: 10px; margin-bottom: 15px; width: 250px;">
                <button id="submit-password" style="padding: 10px 20px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">Submit</button>
                <p id="error-message" style="color: red; margin-top: 10px; display: none;">Incorrect password. Please try again.</p>
            `;
            
            overlay.appendChild(passwordForm);
            document.body.appendChild(overlay);
            
            // Set password (change this to your desired password)
            const correctPassword = "SFK2025";
            
            // Add event listener to button
            document.getElementById('submit-password').addEventListener('click', function() {
                const inputPassword = document.getElementById('password-input').value;
                
                if (inputPassword === correctPassword) {
                    // Store authentication in session storage
                    sessionStorage.setItem('authenticated', 'true');
                    // Remove overlay
                    document.body.removeChild(overlay);
                } else {
                    // Show error message
                    document.getElementById('error-message').style.display = 'block';
                }
            });
            
            // Add enter key support
            document.getElementById('password-input').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    document.getElementById('submit-password').click();
                }
            });
        });
    }
})();
