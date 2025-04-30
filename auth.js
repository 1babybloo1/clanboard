// auth.js - Handles authentication state, UI updates, login/signup logic

// Wait for the DOM to be fully loaded before accessing elements
document.addEventListener('DOMContentLoaded', () => {

    // Check if Firebase is available and initialized
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        console.error("Firebase is not available or not initialized. Ensure firebase-config.js runs first.");
        // Display error to user? E.g., disable auth buttons
        const authButton = document.getElementById('authButton');
        if (authButton) authButton.disabled = true;
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) logoutButton.disabled = true;
        return; // Stop execution of this script if Firebase isn't ready
    }

    // --- Get Firebase Services (ONLY after ensuring Firebase is initialized) ---
    const auth = firebase.auth();
    const db = firebase.firestore(); // Get Firestore instance if needed by auth logic (currently not, but good practice)

    // --- DOM Elements (Access AFTER DOMContentLoaded) ---
    const authButton = document.getElementById('authButton');
    const logoutButton = document.getElementById('logoutButton');
    const authModal = document.getElementById('authModal');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginError = document.getElementById('loginError');
    const signupError = document.getElementById('signupError');
    // Other elements if needed

    // --- Global state ---
    let loggedInUser = null; // Store current user state

    // --- Authentication State Change Listener ---
    auth.onAuthStateChanged(user => {
        loggedInUser = user; // Update user state
        updateAuthUI(user); // Update UI elements

        // Page-specific actions based on auth state
        if (user) {
            console.log("User is signed in:", user.uid);
            // Actions for when user is signed in (e.g., redirect handling is below)
        } else {
            console.log("User is signed out.");
             // If on submit page and logged out, redirect back to index
             if (window.location.pathname.includes('submit.html')) {
                console.log("User logged out on submit page, redirecting to index.");
                window.location.href = 'index.html';
            }
        }
    });

    // --- UI Update Function ---
    function updateAuthUI(user) {
        // Hide/Show Add Clan vs Logout buttons (ensure elements exist first)
        if (authButton) {
             // On index page, 'Add Your Clan' button hides when logged in
             // On submit page, this button likely doesn't exist
             if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                 authButton.style.display = user ? 'none' : 'block';
             } else {
                  authButton.style.display = 'none'; // Assume not shown on other pages like submit.html
             }
        }
        if (logoutButton) {
            logoutButton.style.display = user ? 'block' : 'none';
        }

        // Close login/signup modal if it's open when auth state changes
        if (authModal && authModal.style.display === 'flex') {
            closeAuthModal();
        }
    }

    // Make updateAuthUI globally accessible (optional, if other scripts need it)
    // window.updateAuthUI = updateAuthUI;

    // --- Event Listeners ---

    // 'Add Your Clan' / Login Button (mainly for index.html)
    if (authButton) {
        authButton.addEventListener('click', () => {
            if (loggedInUser) {
                // If already logged in (e.g., on index page, this button should be hidden, but safety check), redirect
                 window.location.href = 'submit.html';
            } else {
                // If logged out, open the login/signup modal
                 openAuthModal(); // Defined below
            }
        });
    }

    // Logout Button (should exist on pages where logout is possible)
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            auth.signOut()
                .then(() => {
                    console.log('User signed out successfully.');
                    // onAuthStateChanged handles UI updates and potential redirect if on submit.html
                    // Optionally, force redirect to index page regardless
                     // if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
                    //    window.location.href = 'index.html';
                    // }
                })
                .catch(error => {
                    console.error('Sign out error:', error);
                    alert("Error signing out: " + error.message);
                });
        });
    }

    // Login Form Submission (only on index.html with the modal)
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearAuthErrors();
            const emailInput = document.getElementById('loginEmail');
            const passwordInput = document.getElementById('loginPassword');
             if (!emailInput || !passwordInput) return; // Element check

            const email = emailInput.value;
            const password = passwordInput.value;

             setLoading(loginForm.querySelector('button'), true, "Logging in..."); // Visual feedback

            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    console.log("Login successful", userCredential.user);
                     window.location.href = 'submit.html'; // Redirect on success
                })
                .catch((error) => {
                    console.error("Login error:", error);
                    if (loginError) loginError.textContent = mapAuthError(error.code); // Map common codes
                     setLoading(loginForm.querySelector('button'), false, "Login");
                });
        });
    }

    // Signup Form Submission (only on index.html with the modal)
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearAuthErrors();
            const emailInput = document.getElementById('signupEmail');
            const passwordInput = document.getElementById('signupPassword');
            if (!emailInput || !passwordInput) return;

            const email = emailInput.value;
            const password = passwordInput.value;

            if (password.length < 6) {
                 if (signupError) signupError.textContent = "Password must be at least 6 characters long.";
                 return;
            }

             setLoading(signupForm.querySelector('button'), true, "Signing Up...");

            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    console.log("Signup successful", userCredential.user);
                     window.location.href = 'submit.html'; // Redirect on success
                })
                .catch((error) => {
                    console.error("Signup error:", error);
                     if (signupError) signupError.textContent = mapAuthError(error.code);
                     setLoading(signupForm.querySelector('button'), false, "Sign Up");
                });
        });
    }

    // --- Modal Functions (Specific to index.html modal structure) ---
    function openAuthModal() {
        if (!authModal) return; // Only proceed if modal exists
        authModal.style.display = "flex"; // Use flex as per CSS for centering
        if (loginForm) loginForm.reset(); // Reset forms on open
        if (signupForm) signupForm.reset();
        clearAuthErrors();
        openTab(null, 'login'); // Default to login tab when opening
    }

    function closeAuthModal() {
        if (authModal) {
            authModal.style.display = "none";
        }
    }

    function openTab(evt, tabName) {
        if (!authModal) return;
        let i, tabcontent, tablinks;
        tabcontent = authModal.querySelectorAll(".tab-content");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
            tabcontent[i].classList.remove("active");
        }
        tablinks = authModal.querySelectorAll(".tab-link"); // Corrected selector from original example if needed
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].classList.remove("active");
        }
        const currentTabContent = document.getElementById(tabName);
        if(currentTabContent) {
            currentTabContent.style.display = "block";
            currentTabContent.classList.add("active");
        }
        // Make the clicked button active
        if (evt?.currentTarget) {
             evt.currentTarget.classList.add("active");
        } else {
             // If called without an event (e.g., default opening), activate the corresponding button
             const defaultTabButton = authModal.querySelector(`.tab-link[onclick*="'${tabName}'"]`);
            if (defaultTabButton) defaultTabButton.classList.add('active');
        }
        clearAuthErrors();
    }

     // Make modal functions globally available for inline 'onclick' handlers
     window.openTab = openTab;
     window.closeAuthModal = closeAuthModal;


     // --- Helper Functions ---
     function clearAuthErrors() {
         if(loginError) loginError.textContent = '';
         if(signupError) signupError.textContent = '';
     }

     // Simple loading state for form buttons
     function setLoading(buttonElement, isLoading, loadingText = "Processing...") {
         if (!buttonElement) return;
         const originalText = buttonElement.dataset.originalText || buttonElement.textContent;
         if (isLoading) {
             if (!buttonElement.dataset.originalText) { // Store original text only once
                 buttonElement.dataset.originalText = originalText;
             }
             buttonElement.disabled = true;
             buttonElement.textContent = loadingText;
         } else {
             buttonElement.disabled = false;
             buttonElement.textContent = originalText; // Restore original text
         }
     }

    // Map common Firebase Auth error codes to friendlier messages
     function mapAuthError(errorCode) {
         switch (errorCode) {
             case 'auth/invalid-email':
                 return 'Please enter a valid email address.';
             case 'auth/user-disabled':
                 return 'This account has been disabled.';
             case 'auth/user-not-found':
                 return 'No account found with this email.';
             case 'auth/wrong-password':
                 return 'Incorrect password. Please try again.';
             case 'auth/email-already-in-use':
                 return 'An account already exists with this email address.';
             case 'auth/weak-password':
                 return 'Password is too weak. Please use at least 6 characters.';
             case 'auth/requires-recent-login':
                  return 'Please log in again to complete this action.';
             default:
                 return 'An unknown error occurred. Please try again.'; // Generic fallback
         }
     }


     // Click outside modal to close (specific to index.html modal)
    if (authModal) { // Only add this listener if the modal exists
         window.addEventListener('click', function(event) {
             if (event.target == authModal) {
                 closeAuthModal();
             }
         });
     }

}); // End DOMContentLoaded listener
