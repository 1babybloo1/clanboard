// auth.js - Handles authentication state, UI updates, login/signup logic

document.addEventListener('DOMContentLoaded', () => {

    // Check if Firebase is available and initialized
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        console.error("Firebase is not available or not initialized. Ensure firebase-config.js runs first.");
        const authContainer = document.querySelector('.auth-container');
        if (authContainer) authContainer.innerHTML = '<p style="color: var(--danger); padding: 0.5rem;">Error: Config</p>';
        return;
    }

    // --- Get Firebase Services ---
    const auth = firebase.auth();
    // const db = firebase.firestore(); // Optional: Get Firestore if needed

    // --- DOM Elements ---
    // These elements primarily exist on index.html
    const authButton = document.getElementById('authButton'); // "Add Your Clan" / Login prompt button
    const manageClansButton = document.getElementById('manageClansButton'); // "Manage Clans" button
    const logoutButton = document.getElementById('logoutButton'); // Logout button
    const authModal = document.getElementById('authModal'); // The modal itself
    const loginForm = document.getElementById('loginForm'); // Login form inside modal
    const signupForm = document.getElementById('signupForm'); // Signup form inside modal
    const loginError = document.getElementById('loginError'); // Error message area for login
    const signupError = document.getElementById('signupError'); // Error message area for signup

    // --- Global state ---
    let loggedInUser = null;

    // --- Authentication State Change Listener ---
    auth.onAuthStateChanged(user => {
        loggedInUser = user; // Store user state
        updateAuthUI(user); // Update buttons and UI based on state

        if (user) {
            console.log("Auth: User is signed in -", user.uid);
        } else {
            console.log("Auth: User is signed out.");
            // Redirect logged-out users away from the submit page if they land there
            if (window.location.pathname.includes('submit.html')) {
                console.log("Auth: User logged out on submit page, redirecting to index.");
                window.location.href = 'index.html';
            }
        }
    });

    // --- UI Update Function ---
    function updateAuthUI(user) {
        // Determine if we are on the main index page
        // This check assumes index.html is the root or explicitly named
        const isOnIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';

        // --- Button Visibility Logic ---
        if (user) {
            // User is LOGGED IN
            if (isOnIndexPage) {
                // Logged in on the index page: Show Manage & Logout, hide Add
                if (authButton) authButton.style.display = 'none';
                if (manageClansButton) manageClansButton.style.display = 'block'; // Or 'flex' if using flex alignment
                if (logoutButton) logoutButton.style.display = 'block'; // Or 'flex'
            } else {
                 // Logged in, but NOT on index page (e.g., on submit.html):
                 // Hide "Add", hide "Manage", show "Logout" (assuming logout exists there)
                 if (authButton) authButton.style.display = 'none';
                 if (manageClansButton) manageClansButton.style.display = 'none';
                 if (logoutButton) logoutButton.style.display = 'block'; // Or 'flex'
            }
        } else {
            // User is LOGGED OUT
             if (isOnIndexPage) {
                 // Logged out on the index page: Show Add, hide Manage & Logout
                 if (authButton) authButton.style.display = 'block'; // Or 'flex'
                 if (manageClansButton) manageClansButton.style.display = 'none';
                 if (logoutButton) logoutButton.style.display = 'none';
             } else {
                 // Logged out, NOT on index page: Hide all? Or show Add if they somehow land elsewhere?
                 // Safer to hide all if they aren't on index
                 if (authButton) authButton.style.display = 'none';
                 if (manageClansButton) manageClansButton.style.display = 'none';
                 if (logoutButton) logoutButton.style.display = 'none';
             }
        }

        // Close login/signup modal if it's open when auth state changes
        if (authModal && authModal.style.display === 'flex') {
            closeAuthModal();
        }
    }

    // --- Event Listeners ---

    // 'Add Your Clan' Button (Trigger login modal when clicked while logged out)
    if (authButton) {
        authButton.addEventListener('click', () => {
            if (!loggedInUser) { // Should only be clickable when logged out
                openAuthModal();
            }
        });
    }

    // 'Manage Clans' Button (Navigate to submit page when clicked while logged in)
    if (manageClansButton) {
        manageClansButton.addEventListener('click', () => {
            if (loggedInUser) { // Should only be clickable when logged in
                window.location.href = 'submit.html';
            }
        });
    }

    // Logout Button
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            auth.signOut()
                .then(() => {
                    console.log('Auth: User signed out successfully.');
                })
                .catch(error => {
                    console.error('Auth: Sign out error:', error);
                    alert("Error signing out: " + mapAuthError(error.code));
                });
        });
    }

    // --- Modal Form Submissions (Only run if forms exist on the current page, e.g., index.html) ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearAuthErrors();
            const emailInput = document.getElementById('loginEmail');
            const passwordInput = document.getElementById('loginPassword');
            if (!emailInput || !passwordInput) return;

            const email = emailInput.value;
            const password = passwordInput.value;
            const submitButton = loginForm.querySelector('button[type="submit"]');

            setLoading(submitButton, true, "Logging in...");

            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    console.log("Auth: Login successful", userCredential.user);
                    // Redirect to submit.html AFTER successful login
                    window.location.href = 'submit.html';
                })
                .catch((error) => {
                    console.error("Auth: Login error:", error);
                    if (loginError) loginError.textContent = mapAuthError(error.code);
                    setLoading(submitButton, false, "Login");
                });
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearAuthErrors();
            const emailInput = document.getElementById('signupEmail');
            const passwordInput = document.getElementById('signupPassword');
            if (!emailInput || !passwordInput) return;

            const email = emailInput.value;
            const password = passwordInput.value;
            const submitButton = signupForm.querySelector('button[type="submit"]');


            if (password.length < 6) {
                 if (signupError) signupError.textContent = "Password must be at least 6 characters long.";
                 return;
            }

            setLoading(submitButton, true, "Signing Up...");

            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    console.log("Auth: Signup successful", userCredential.user);
                    // Redirect to submit.html AFTER successful signup
                    window.location.href = 'submit.html';
                })
                .catch((error) => {
                    console.error("Auth: Signup error:", error);
                    if (signupError) signupError.textContent = mapAuthError(error.code);
                    setLoading(submitButton, false, "Sign Up");
                });
        });
    }


    // --- Modal Display Functions ---
    function openAuthModal() {
        if (!authModal) return;
        authModal.style.display = "flex";
        if (loginForm) loginForm.reset();
        if (signupForm) signupForm.reset();
        clearAuthErrors();
        openTab(null, 'login'); // Default to login tab
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
        tablinks = authModal.querySelectorAll(".tab-link");

        tabcontent.forEach(tc => {
             tc.style.display = "none";
             tc.classList.remove("active");
        });
        tablinks.forEach(tl => tl.classList.remove("active"));

        const currentTabContent = document.getElementById(tabName);
        if (currentTabContent) {
            currentTabContent.style.display = "block";
            currentTabContent.classList.add("active");
        }
        if (evt?.currentTarget) {
             evt.currentTarget.classList.add("active");
        } else {
            const defaultTabButton = authModal.querySelector(`.tab-link[onclick*="'${tabName}'"]`);
            if (defaultTabButton) defaultTabButton.classList.add('active');
        }
        clearAuthErrors();
    }

    // Expose functions for inline 'onclick' calls in HTML
    window.openTab = openTab;
    window.closeAuthModal = closeAuthModal;


    // --- Helper Functions ---
    function clearAuthErrors() {
        if (loginError) loginError.textContent = '';
        if (signupError) signupError.textContent = '';
    }

    function setLoading(buttonElement, isLoading, loadingText = "Processing...") {
        if (!buttonElement) return;
        const originalText = buttonElement.dataset.originalText || buttonElement.textContent;
        if (isLoading) {
            if (!buttonElement.dataset.originalText) {
                buttonElement.dataset.originalText = originalText;
            }
            buttonElement.disabled = true;
            buttonElement.textContent = loadingText;
        } else {
            buttonElement.disabled = false;
            buttonElement.textContent = buttonElement.dataset.originalText || 'Submit';
            // delete buttonElement.dataset.originalText; // Optionally clear after restore
        }
    }

    function mapAuthError(errorCode) {
        switch (errorCode) {
            case 'auth/invalid-email': return 'Please enter a valid email address.';
            case 'auth/user-disabled': return 'This account has been disabled.';
            case 'auth/user-not-found': return 'No account found with this email.';
            case 'auth/wrong-password': return 'Incorrect password. Please try again.';
            case 'auth/email-already-in-use': return 'An account already exists with this email address.';
            case 'auth/weak-password': return 'Password is too weak. Please use at least 6 characters.';
            case 'auth/requires-recent-login': return 'Please log in again to complete this action.';
            default: return `An error occurred (${errorCode}). Please try again.`;
        }
    }

    // Close modal if clicked outside (only add listener if modal exists on page)
    if (authModal) {
        window.addEventListener('click', function(event) {
            if (event.target == authModal) {
                closeAuthModal();
            }
        });
    }

}); // End DOMContentLoaded listener
