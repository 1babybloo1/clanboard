const authButton = document.getElementById('authButton');
const logoutButton = document.getElementById('logoutButton');
const authModal = document.getElementById('authModal');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');

let redirectToProfile = false; // Flag to redirect after login/signup

// --- Modal Handling ---
function openAuthModal(redirect = false) {
    redirectToProfile = redirect;
    if (authModal) authModal.style.display = 'flex'; // Use flex to trigger centering
    // Reset forms and errors
    if (loginForm) loginForm.reset();
    if (signupForm) signupForm.reset();
    if (loginError) loginError.textContent = '';
    if (signupError) signupError.textContent = '';
    // Default to login tab
    openTab(null, 'login'); // Ensure login tab is active
    const loginTabButton = document.querySelector('#authTabs button[onclick*="login"]');
    if (loginTabButton) loginTabButton.click();
}

function closeAuthModal() {
    if (authModal) authModal.style.display = 'none';
    redirectToProfile = false; // Reset flag
}

// Close modal if clicked outside the content area
window.onclick = function(event) {
    if (event.target == authModal) {
        closeAuthModal();
    }
}

// --- Tab Switching ---
function openTab(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    const currentTab = document.getElementById(tabName);
    if (currentTab) currentTab.style.display = "block";
    if (evt) evt.currentTarget.className += " active";

     // Reset errors when switching tabs
     if (loginError) loginError.textContent = '';
     if (signupError) signupError.textContent = '';
}

// --- Firebase Auth Listener ---
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        console.log("User logged in:", user.email);
        if (authButton) authButton.textContent = 'Profile';
        if (authButton) authButton.onclick = () => { window.location.href = 'profile.html'; };
        if (logoutButton) logoutButton.style.display = 'inline-block';
        closeAuthModal(); // Close modal if open
        // Check if we need to redirect (only if the flag was set by "Add Your Clan")
        if (redirectToProfile) {
            window.location.href = 'profile.html';
            redirectToProfile = false; // Reset flag after redirect
        }
    } else {
        // User is signed out
        console.log("User logged out");
        if (authButton) authButton.textContent = 'Add Your Clan';
        if (authButton) authButton.onclick = () => openAuthModal(true); // Set redirect flag on click
        if (logoutButton) logoutButton.style.display = 'none';
    }
    // If the main clan rendering depends on auth state, trigger it here
    if (typeof renderClans === 'function') {
         // Assuming renderClans might need to know the user for edit/delete,
         // but for the main page, it might not matter. Let's just re-render.
         // Pass the user object if needed by renderClans later.
         renderClans();
    }
     // If on profile page, potentially refresh user-specific data
    if (typeof loadUserProfile === 'function') {
        loadUserProfile();
    }
});

// --- Event Listeners ---

// Initial "Add Your Clan" button
if (authButton) {
    // The initial setup is handled by onAuthStateChanged,
    // but we set the initial click handler here in case the state change hasn't fired yet
     authButton.onclick = () => {
         if (auth.currentUser) {
            window.location.href = 'profile.html';
         } else {
            openAuthModal(true); // Open modal and set redirect flag
         }
     };
}


// Logout Button
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        auth.signOut().then(() => {
            console.log("Logout successful");
            // Redirect to home page after logout
            if (window.location.pathname.includes('profile.html')) {
                window.location.href = 'index.html';
            }
        }).catch(error => {
            console.error("Logout failed:", error);
            alert("Logout failed. Please try again."); // Simple feedback
        });
    });
}


// Login Form Submission
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        loginError.textContent = ''; // Clear previous errors

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                console.log("Login successful for:", userCredential.user.email);
                // Modal closing and redirection are handled by onAuthStateChanged
            })
            .catch((error) => {
                console.error("Login error:", error.code, error.message);
                loginError.textContent = error.message; // Show error to user
            });
    });
}

// Signup Form Submission
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        signupError.textContent = ''; // Clear previous errors

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed up and signed in
                console.log("Signup successful for:", userCredential.user.email);
                // Modal closing and redirection are handled by onAuthStateChanged
            })
            .catch((error) => {
                console.error("Signup error:", error.code, error.message);
                signupError.textContent = error.message; // Show error to user
            });
    });
}

// Make modal functions global if needed (alternative to inline onclick)
window.closeAuthModal = closeAuthModal;
window.openTab = openTab;
