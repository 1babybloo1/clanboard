// Elements (assuming these are already defined as in your original code)
const profileContent = document.getElementById('profileContent');
const loginPrompt = document.getElementById('loginPrompt');
const welcomeMessage = document.getElementById('welcomeMessage');
const clanForm = document.getElementById('clanForm');
const formTitle = document.getElementById('formTitle');
const clanIdInput = document.getElementById('clanId');
const clanNameInput = document.getElementById('clanName');
const clanDescriptionInput = document.getElementById('clanDescription');
const clanDiscordInput = document.getElementById('clanDiscord');
const clanStatusInput = document.getElementById('clanStatus');
const clanLogoUrlInput = document.getElementById('clanLogoUrl');
const clanCoverImageUrlInput = document.getElementById('clanCoverImageUrl');
const logoPreview = document.getElementById('logoPreview');
const bannerPreview = document.getElementById('bannerPreview');
const uploadLogoBtn = document.getElementById('uploadLogoBtn');
const uploadBannerBtn = document.getElementById('uploadBannerBtn');
const submitClanBtn = document.getElementById('submitClanBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const formMessage = document.getElementById('formMessage');
const userClansList = document.getElementById('userClansList');
const loadingClansMsg = document.getElementById('loadingClansMsg');

// --- Security & Limit Configuration ---
const MAX_CLAN_NAME_WORDS = 10; // Example: Max 10 words for clan name
const MAX_CLAN_DESC_WORDS = 100; // Example: Max 100 words for description
const MAX_USER_CLANS = 5; // Maximum clans per user
const SUBMIT_RATE_LIMIT_MS = 5000; // 5 seconds cooldown between submissions

// --- State Variables ---
let lastSubmitTimestamp = 0;
let isSubmitting = false; // Prevent double clicks while processing

// --- Helper Functions ---
function displayFormMessage(message, isError = true) {
    formMessage.textContent = message;
    formMessage.style.color = isError ? 'red' : 'green';
    formMessage.style.display = 'block';
}

function clearFormMessage() {
    formMessage.textContent = '';
    formMessage.style.display = 'none';
}

function countWords(str) {
    if (!str) return 0;
    return str.trim().split(/\s+/).filter(Boolean).length; // Split by whitespace, remove empty strings
}

// --- Event Listeners ---

// (Keep your existing Cloudinary upload logic, fetchUserClans, display clans etc.)

// Modify the Submit Clan Button Listener
submitClanBtn.addEventListener('click', async (e) => {
    e.preventDefault(); // Prevent default form submission
    clearFormMessage(); // Clear previous messages

    if (isSubmitting) {
        return; // Prevent double clicks
    }

    // --- 1. Rate Limiting Check ---
    const now = Date.now();
    if (now - lastSubmitTimestamp < SUBMIT_RATE_LIMIT_MS) {
        const timeLeft = Math.ceil((SUBMIT_RATE_LIMIT_MS - (now - lastSubmitTimestamp)) / 1000);
        displayFormMessage(`Please wait ${timeLeft} seconds before submitting again.`);
        return;
    }

    // --- 2. Max Clan Limit Check (Only for *new* clans) ---
    const isCreatingNewClan = !clanIdInput.value;
    if (isCreatingNewClan) {
        const currentClanCount = userClansList.querySelectorAll('li').length; // Assumes list items represent clans
        if (currentClanCount >= MAX_USER_CLANS) {
            displayFormMessage(`You have reached the maximum limit of ${MAX_USER_CLANS} clans.`);
            return;
        }
    }

    // --- 3. Input Validation & Word Count Limits ---
    const clanName = clanNameInput.value.trim();
    const clanDescription = clanDescriptionInput.value.trim();
    const nameWords = countWords(clanName);
    const descWords = countWords(clanDescription);

    if (!clanName) {
        displayFormMessage('Clan Name is required.');
        clanNameInput.focus();
        return;
    }
    if (nameWords > MAX_CLAN_NAME_WORDS) {
        displayFormMessage(`Clan Name cannot exceed ${MAX_CLAN_NAME_WORDS} words (currently ${nameWords}).`);
        clanNameInput.focus();
        return;
    }
    if (!clanDescription) {
        displayFormMessage('Clan Description is required.');
        clanDescriptionInput.focus();
        return;
    }
     if (descWords > MAX_CLAN_DESC_WORDS) {
        displayFormMessage(`Clan Description cannot exceed ${MAX_CLAN_DESC_WORDS} words (currently ${descWords}).`);
        clanDescriptionInput.focus();
        return;
    }
    // Add other basic validations if needed (e.g., Discord URL format)

    // --- If all checks pass, proceed with submission ---
    isSubmitting = true;
    submitClanBtn.disabled = true; // Disable button during submission
    submitClanBtn.textContent = 'Submitting...';
    // Record the time *before* the async call starts
    lastSubmitTimestamp = Date.now();

    try {
        // Gather form data (ensure you collect all necessary fields)
        const clanData = {
            id: clanIdInput.value || null, // Send null if creating new
            name: clanName,
            description: clanDescription,
            discord_link: clanDiscordInput.value.trim(),
            status: clanStatusInput.value,
            logo_url: clanLogoUrlInput.value, // Assuming URL is stored here after upload
            cover_image_url: clanCoverImageUrlInput.value, // Assuming URL is stored here
            // Include owner_id or necessary authentication token if your API requires it
        };

        console.log("Submitting Clan Data:", clanData);

        // --- !!! PLACEHOLDER: Replace with your actual API call !!! ---
        // Example using fetch:
        // const apiUrl = clanData.id ? `/api/clans/${clanData.id}` : '/api/clans';
        // const method = clanData.id ? 'PUT' : 'POST';
        // const response = await fetch(apiUrl, {
        //     method: method,
        //     headers: {
        //         'Content-Type': 'application/json',
        //         // Include Authorization headers if needed
        //         // 'Authorization': `Bearer ${your_auth_token}`
        //     },
        //     body: JSON.stringify(clanData),
        // });
        // if (!response.ok) {
        //    const errorData = await response.json();
        //    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        // }
        // const result = await response.json();
        // console.log('API Success:', result);
        // --- End Placeholder ---

        // Simulate API success for demonstration
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        console.log("Simulated API Success");
        displayFormMessage(`Clan ${clanData.id ? 'updated' : 'created'} successfully!`, false);


        // Refresh clan list and reset form on success
        // resetClanForm(); // You might need a function to fully reset the form
        clanForm.reset(); // Basic reset
        logoPreview.src = '#'; // Reset previews
        bannerPreview.src = '#';
        logoPreview.style.display = 'none';
        bannerPreview.style.display = 'none';
        clanIdInput.value = ''; // Ensure ID is cleared
        formTitle.textContent = 'Create New Clan';
        cancelEditBtn.style.display = 'none'; // Hide cancel button
        // await fetchUserClans(); // Refresh the list from the server

    } catch (error) {
        console.error('Clan submission error:', error);
        displayFormMessage(`Error: ${error.message}`);
        // Don't reset the rate limit timestamp on failure, let the cooldown apply
    } finally {
        isSubmitting = false; // Re-enable submission possibility
        submitClanBtn.disabled = false; // Re-enable button
        submitClanBtn.textContent = 'Submit Clan';
    }
});

// Add event listeners for real-time word count feedback (Optional but good UX)
clanNameInput.addEventListener('input', () => {
    const words = countWords(clanNameInput.value);
    const feedbackEl = document.getElementById('clanNameWordCount'); // Add a <span id="clanNameWordCount"> near the input
    if (feedbackEl) {
         feedbackEl.textContent = `${words}/${MAX_CLAN_NAME_WORDS} words`;
         feedbackEl.style.color = words > MAX_CLAN_NAME_WORDS ? 'red' : 'inherit';
    }
     clearFormMessage(); // Clear validation errors when user types
});

clanDescriptionInput.addEventListener('input', () => {
    const words = countWords(clanDescriptionInput.value);
    const feedbackEl = document.getElementById('clanDescWordCount'); // Add a <span id="clanDescWordCount"> near the input
    if (feedbackEl) {
        feedbackEl.textContent = `${words}/${MAX_CLAN_DESC_WORDS} words`;
        feedbackEl.style.color = words > MAX_CLAN_DESC_WORDS ? 'red' : 'inherit';
    }
     clearFormMessage(); // Clear validation errors when user types
});

// Make sure to call fetchUserClans() when the profile page loads
// Example: checkLoginStatus().then(user => { if (user) fetchUserClans(user.id); });
