const authButton = document.getElementById('authButton');
const logoutButton = document.getElementById('logoutButton');
const authModal = document.getElementById('authModal');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');

let redirectToProfile = false; // Flag to redirect after login/signup

const blacklistedWords = ['admin', 'moderator', 'staff', 'support', 'god', 'dev']; // Customize as needed

// --- Modal Handling ---
function openAuthModal(redirect = false) {
    redirectToProfile = redirect;
    if (authModal) authModal.style.display = 'flex';
    if (loginForm) loginForm.reset();
    if (signupForm) signupForm.reset();
    if (loginError) loginError.textContent = '';
    if (signupError) signupError.textContent = '';
    openTab(null, 'login');
    const loginTabButton = document.querySelector('#authTabs button[onclick*="login"]');
    if (loginTabButton) loginTabButton.click();
}

function closeAuthModal() {
    if (authModal) authModal.style.display = 'none';
    redirectToProfile = false;
}

window.onclick = function(event) {
    if (event.target == authModal) {
        closeAuthModal();
    }
};

// --- Tab Switching ---
function openTab(evt, tabName) {
    let tabcontent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    let tablinks = document.getElementsByClassName("tab-link");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    const currentTab = document.getElementById(tabName);
    if (currentTab) currentTab.style.display = "block";
    if (evt) evt.currentTarget.className += " active";
    if (loginError) loginError.textContent = '';
    if (signupError) signupError.textContent = '';
}

// --- Firebase Auth Listener ---
auth.onAuthStateChanged(user => {
    if (user) {
        console.log("User logged in:", user.email);
        if (authButton) {
            authButton.textContent = 'Profile';
            authButton.onclick = () => { window.location.href = 'profile.html'; };
        }
        if (logoutButton) logoutButton.style.display = 'inline-block';
        closeAuthModal();
        if (redirectToProfile) {
            window.location.href = 'profile.html';
            redirectToProfile = false;
        }
    } else {
        console.log("User logged out");
        if (authButton) {
            authButton.textContent = 'Add Your Clan';
            authButton.onclick = () => openAuthModal(true);
        }
        if (logoutButton) logoutButton.style.display = 'none';
    }
    if (typeof renderClans === 'function') renderClans();
    if (typeof loadUserProfile === 'function') loadUserProfile();
});

// --- Event Listeners ---

if (authButton) {
    authButton.onclick = () => {
        if (auth.currentUser) {
            window.location.href = 'profile.html';
        } else {
            openAuthModal(true);
        }
    };
}

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        auth.signOut().then(() => {
            console.log("Logout successful");
            if (window.location.pathname.includes('profile.html')) {
                window.location.href = 'index.html';
            }
        }).catch(error => {
            console.error("Logout failed:", error);
            alert("Logout failed. Please try again.");
        });
    });
}

// --- Login Form Submission ---
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        loginError.textContent = '';

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log("Login successful for:", userCredential.user.email);
            })
            .catch((error) => {
                console.error("Login error:", error.code, error.message);
                loginError.textContent = error.message;
            });
    });
}

// --- Signup Form Submission (with blacklist check) ---
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const usernameInput = document.getElementById('signupUsername');
        const username = usernameInput ? usernameInput.value.trim().toLowerCase() : '';
        signupError.textContent = '';

        // Username validation
        if (!username) {
            signupError.textContent = 'Username is required.';
            return;
        }

        const isBlacklisted = blacklistedWords.some(word => username.includes(word));
        if (isBlacklisted) {
            signupError.textContent = 'Username contains a restricted word. Please choose another.';
            return;
        }

        // Firebase Signup
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log("Signup successful for:", userCredential.user.email);
                return userCredential.user.updateProfile({ displayName: username });
            })
            .catch((error) => {
                console.error("Signup error:", error.code, error.message);
                signupError.textContent = error.message;
            });
    });
}

// --- Make modal/tab functions globally accessible ---
window.closeAuthModal = closeAuthModal;
window.openTab = openTab;
