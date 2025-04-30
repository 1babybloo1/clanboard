// ======================================================
//          Elements
// ======================================================
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
const clanLogoUrlInput = document.getElementById('clanLogoUrl'); // Hidden input to store URL
const clanCoverImageUrlInput = document.getElementById('clanCoverImageUrl'); // Hidden input to store URL
const logoPreview = document.getElementById('logoPreview');
const bannerPreview = document.getElementById('bannerPreview');
const uploadLogoBtn = document.getElementById('uploadLogoBtn'); // The actual <input type="file">
const uploadBannerBtn = document.getElementById('uploadBannerBtn'); // The actual <input type="file">
const logoUploadLabel = document.querySelector('label[for="uploadLogoBtn"]'); // Optional: Label acting as button
const bannerUploadLabel = document.querySelector('label[for="uploadBannerBtn"]'); // Optional: Label acting as button
const submitClanBtn = document.getElementById('submitClanBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const formMessage = document.getElementById('formMessage');
const userClansList = document.getElementById('userClansList');
const loadingClansMsg = document.getElementById('loadingClansMsg');

// ======================================================
//          Configuration
// ======================================================
// --- Cloudinary Config (Replace with your actual details) ---
const CLOUDINARY_URL = 'khttps://api.cloudinary.com/v1_1/djttn4xv'; // e.g., 'https://api.cloudinary.com/v1_1/your_cloud_name/upload'
const CLOUDINARY_UPLOAD_PRESET = 'compmanage'; // Your *unsigned* preset name

// --- Security & Limit Configuration ---
const MAX_CLAN_NAME_WORDS = 1;     // Max words for clan name
const MAX_CLAN_DESC_WORDS = 100;    // Max words for description
const MAX_USER_CLANS = 5;           // Maximum clans per user
const SUBMIT_RATE_LIMIT_MS = 3.6e+6;  // 5 seconds cooldown between submissions

// ======================================================
//          State Variables
// ======================================================
let lastSubmitTimestamp = 0;
let isSubmitting = false; // Prevent double clicks during API calls
let currentUser = null; // Store logged-in user info

// ======================================================
//          Helper Functions
// ======================================================

/**
 * Displays a message in the form message area.
 * @param {string} message - The message to display.
 * @param {boolean} [isError=true] - True for error styling (red), false for success (green).
 */
function displayFormMessage(message, isError = true) {
    formMessage.textContent = message;
    formMessage.style.color = isError ? 'red' : 'green';
    formMessage.style.display = 'block';
    // Optional: Scroll form message into view
    // formMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Clears the form message area.
 */
function clearFormMessage() {
    formMessage.textContent = '';
    formMessage.style.display = 'none';
}

/**
 * Counts words in a string.
 * @param {string} str - The string to count words in.
 * @returns {number} The word count.
 */
function countWords(str) {
    if (!str) return 0;
    return str.trim().split(/\s+/).filter(Boolean).length; // Split by whitespace, remove empty strings
}

/**
 * Resets the clan form to its default state for creating a new clan.
 */
function resetClanForm() {
    clanForm.reset(); // Resets native form elements
    clanIdInput.value = ''; // Clear hidden ID
    clanLogoUrlInput.value = ''; // Clear hidden logo URL
    clanCoverImageUrlInput.value = ''; // Clear hidden banner URL
    logoPreview.src = '#';
    logoPreview.style.display = 'none';
    bannerPreview.src = '#';
    bannerPreview.style.display = 'none';
    formTitle.textContent = 'Create New Clan';
    submitClanBtn.textContent = 'Submit Clan';
    cancelEditBtn.style.display = 'none'; // Hide cancel button when creating
    clearFormMessage();
    isSubmitting = false; // Reset submission state
    submitClanBtn.disabled = false; // Ensure button is enabled
    // Reset word count feedback if you have it
    const nameWC = document.getElementById('clanNameWordCount');
    const descWC = document.getElementById('clanDescWordCount');
    if (nameWC) nameWC.textContent = '';
    if (descWC) descWC.textContent = '';
}

// ======================================================
//          Core Functionality (Placeholders & Assumed Logic)
// ======================================================

/**
 * --- !!! PLACEHOLDER: Implement User Authentication Check !!! ---
 * Checks if the user is logged in (e.g., checks session, token).
 * @returns {Promise<object|null>} Promise resolving with user object or null.
 */
async function checkLoginStatus() {
    console.log("Checking login status...");
    // --- Your actual logic here ---
    // Example: Fetch '/api/auth/status', return user data or null
    // For demonstration, simulate a logged-in user:
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate async check
    const loggedInUser = { id: 'user123', username: 'Bloo' }; // Replace with real user data
    // const loggedInUser = null; // Simulate logged out
    // --- End Placeholder ---

    currentUser = loggedInUser; // Store user globally
    if (currentUser) {
        profileContent.style.display = 'block';
        loginPrompt.style.display = 'none';
        welcomeMessage.textContent = `Welcome, ${currentUser.username}! Manage your clans below.`;
        await fetchUserClans(currentUser.id); // Fetch clans only if logged in
    } else {
        profileContent.style.display = 'none';
        loginPrompt.style.display = 'block';
        welcomeMessage.textContent = '';
        userClansList.innerHTML = ''; // Clear any old clans
        loadingClansMsg.style.display = 'none';
    }
    return currentUser;
}

/**
 * --- !!! PLACEHOLDER: Implement Cloudinary Upload !!! ---
 * Uploads a file to Cloudinary using the unsigned preset.
 * @param {File} file - The file to upload.
 * @returns {Promise<string>} Promise resolving with the secure URL of the uploaded image.
 */
async function uploadToCloudinary(file) {
    console.log(`Uploading ${file.name} to Cloudinary...`);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    // --- Your actual fetch call here ---
    try {
        const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Cloudinary upload failed: ${errorData.error.message}`);
        }
        const data = await response.json();
        console.log('Cloudinary Upload Success:', data);
        return data.secure_url; // Return the URL
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        displayFormMessage(`Error uploading image: ${error.message}`);
        throw error; // Re-throw to stop the process if needed
    }
    // --- End Placeholder ---
}

/**
 * --- !!! PLACEHOLDER: Implement Fetching User Clans !!! ---
 * Fetches the clans owned/managed by the current user from your API.
 * @param {string} userId - The ID of the current user.
 */
async function fetchUserClans(userId) {
    console.log(`Fetching clans for user ${userId}...`);
    loadingClansMsg.style.display = 'block';
    userClansList.innerHTML = ''; // Clear previous list

    // --- Your actual API call here ---
    try {
        // Example: const response = await fetch(`/api/users/${userId}/clans`);
        // if (!response.ok) throw new Error(`Failed to fetch clans: ${response.statusText}`);
        // const clans = await response.json();

        // Simulated data for demonstration:
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        const clans = [
            { id: 'clan001', name: 'The First Guard', description: 'Defenders of the realm.', logo_url: 'https://via.placeholder.com/50', cover_image_url: 'https://via.placeholder.com/300x100', discord_link: 'https://discord.gg/example1', status: 'Recruiting' },
            { id: 'clan002', name: 'Shadow Syndicate', description: 'Masters of stealth and secrets. Operating in the dark.', logo_url: 'https://via.placeholder.com/50/0000FF/808080', cover_image_url: 'https://via.placeholder.com/300x100/FF0000/FFFFFF', discord_link: 'https://discord.gg/example2', status: 'Closed' },
        ];
        // --- End Placeholder ---

        displayUserClans(clans);

    } catch (error) {
        console.error("Error fetching user clans:", error);
        loadingClansMsg.textContent = `Error loading clans: ${error.message}`;
        loadingClansMsg.style.color = 'red';
    } finally {
         // Hide loading message only if it wasn't replaced by an error
         if (loadingClansMsg.textContent.startsWith('Loading')) {
             loadingClansMsg.style.display = 'none';
         }
    }
}

/**
 * --- !!! PLACEHOLDER: Implement Displaying User Clans !!! ---
 * Renders the list of user clans in the UI.
 * @param {Array<object>} clans - An array of clan objects.
 */
function displayUserClans(clans) {
    userClansList.innerHTML = ''; // Clear existing list
    if (!clans || clans.length === 0) {
        userClansList.innerHTML = '<li>You haven\'t created or joined any clans yet.</li>';
        return;
    }

    clans.forEach(clan => {
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${clan.logo_url || 'https://via.placeholder.com/40'}" alt="${clan.name} Logo" width="40" height="40" style="vertical-align: middle; margin-right: 10px; border-radius: 5px;">
            <strong>${clan.name}</strong> (${clan.status})
            <button class="edit-clan-btn" data-clan-id="${clan.id}">Edit</button>
            <button class="delete-clan-btn" data-clan-id="${clan.id}">Delete</button>
            `;
         // Store full clan data on the element for easy access in edit/delete
        li.dataset.clanData = JSON.stringify(clan);

        userClansList.appendChild(li);
    });
}


/**
 * --- !!! ASSUMED FUNCTION: Populates the form for editing !!! ---
 * Fills the form fields with data from an existing clan.
 * @param {object} clanData - The clan object containing data.
 */
function populateFormForEdit(clanData) {
    resetClanForm(); // Start with a clean slate

    formTitle.textContent = `Edit Clan: ${clanData.name}`;
    clanIdInput.value = clanData.id;
    clanNameInput.value = clanData.name || '';
    clanDescriptionInput.value = clanData.description || '';
    clanDiscordInput.value = clanData.discord_link || '';
    clanStatusInput.value = clanData.status || 'Recruiting'; // Default if missing
    clanLogoUrlInput.value = clanData.logo_url || '';
    clanCoverImageUrlInput.value = clanData.cover_image_url || '';

    if (clanData.logo_url) {
        logoPreview.src = clanData.logo_url;
        logoPreview.style.display = 'block';
    } else {
        logoPreview.style.display = 'none';
    }
    if (clanData.cover_image_url) {
        bannerPreview.src = clanData.cover_image_url;
        bannerPreview.style.display = 'block';
    } else {
         bannerPreview.style.display = 'none';
    }

    cancelEditBtn.style.display = 'inline-block'; // Show cancel button
    clanForm.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Trigger word count update for existing text
    clanNameInput.dispatchEvent(new Event('input'));
    clanDescriptionInput.dispatchEvent(new Event('input'));
}

/**
 * --- !!! PLACEHOLDER: Implement Clan Deletion !!! ---
 * Handles the deletion of a clan.
 * @param {string} clanId - The ID of the clan to delete.
 */
async function deleteClan(clanId) {
    if (!confirm('Are you sure you want to delete this clan? This action cannot be undone.')) {
        return;
    }
    console.log(`Attempting to delete clan ${clanId}...`);
    // --- Your actual API call here ---
    try {
        // Example:
        // const response = await fetch(`/api/clans/${clanId}`, {
        //     method: 'DELETE',
        //     headers: {
        //         // Add Authorization header if needed
        //     }
        // });
        // if (!response.ok) {
        //     const errorData = await response.json();
        //     throw new Error(errorData.message || `Failed to delete clan: ${response.statusText}`);
        // }

        // Simulate success
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`Clan ${clanId} deleted successfully (simulated).`);

        // Refresh the clan list
        if (currentUser) {
            await fetchUserClans(currentUser.id);
        }
         // If the deleted clan was being edited, reset the form
        if (clanIdInput.value === clanId) {
            resetClanForm();
        }

    } catch (error) {
        console.error(`Error deleting clan ${clanId}:`, error);
        // Display error near the list or as a general alert
        alert(`Error deleting clan: ${error.message}`);
    }
    // --- End Placeholder ---
}


// ======================================================
//          Event Listeners
// ======================================================

// --- Image Upload Listeners ---
uploadLogoBtn.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (logoUploadLabel) logoUploadLabel.textContent = 'Uploading Logo...'; // Update label text

    try {
        const imageUrl = await uploadToCloudinary(file);
        clanLogoUrlInput.value = imageUrl; // Store URL in hidden input
        logoPreview.src = imageUrl;
        logoPreview.style.display = 'block';
        displayFormMessage('Logo uploaded successfully.', false);
    } catch (error) {
        // Error message already shown by uploadToCloudinary
        clanLogoUrlInput.value = ''; // Clear hidden input on failure
        logoPreview.src = '#';
        logoPreview.style.display = 'none';
    } finally {
         if (logoUploadLabel) logoUploadLabel.textContent = 'Upload Logo'; // Reset label text
         uploadLogoBtn.value = null; // Allow re-uploading the same file name
    }
});

uploadBannerBtn.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
     if (bannerUploadLabel) bannerUploadLabel.textContent = 'Uploading Banner...';

    try {
        const imageUrl = await uploadToCloudinary(file);
        clanCoverImageUrlInput.value = imageUrl; // Store URL in hidden input
        bannerPreview.src = imageUrl;
        bannerPreview.style.display = 'block';
        displayFormMessage('Banner uploaded successfully.', false);
    } catch (error) {
        clanCoverImageUrlInput.value = ''; // Clear hidden input on failure
        bannerPreview.src = '#';
        bannerPreview.style.display = 'none';
    } finally {
         if (bannerUploadLabel) bannerUploadLabel.textContent = 'Upload Banner';
         uploadBannerBtn.value = null; // Allow re-uploading the same file name
    }
});

// --- Clan Form Submit Listener (with Security Checks) ---
submitClanBtn.addEventListener('click', async (e) => {
    e.preventDefault(); // Prevent default form submission
    clearFormMessage();

    if (isSubmitting) {
        console.warn("Submission already in progress.");
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
        // Ensure the list is accurate before checking length
        const currentClanCount = userClansList.querySelectorAll('li:not(:has(button.edit-clan-btn))').length > 0 ? userClansList.querySelectorAll('li').length : 0; // More robust count, excludes placeholder msg
        if (currentClanCount >= MAX_USER_CLANS) {
            displayFormMessage(`You have reached the maximum limit of ${MAX_USER_CLANS} clans.`);
            return;
        }
    }

    // --- 3. Input Validation & Word Count Limits ---
    const clanName = clanNameInput.value.trim();
    const clanDescription = clanDescriptionInput.value.trim();
    // Optional: const clanDiscord = clanDiscordInput.value.trim();
    const nameWords = countWords(clanName);
    const descWords = countWords(clanDescription);

    // Basic required fields
    if (!clanName) {
        displayFormMessage('Clan Name is required.');
        clanNameInput.focus();
        return;
    }
     if (!clanDescription) {
        displayFormMessage('Clan Description is required.');
        clanDescriptionInput.focus();
        return;
    }

    // Word count checks
    if (nameWords > MAX_CLAN_NAME_WORDS) {
        displayFormMessage(`Clan Name cannot exceed ${MAX_CLAN_NAME_WORDS} words (currently ${nameWords}).`);
        clanNameInput.focus();
        return;
    }
     if (descWords > MAX_CLAN_DESC_WORDS) {
        displayFormMessage(`Clan Description cannot exceed ${MAX_CLAN_DESC_WORDS} words (currently ${descWords}).`);
        clanDescriptionInput.focus();
        return;
    }

    // Optional: Add more specific validation like Discord link format if needed
    // const discordRegex = /^https:\/\/discord\.gg\/[a-zA-Z0-9]+$/;
    // if (clanDiscord && !discordRegex.test(clanDiscord)) {
    //     displayFormMessage('Please enter a valid Discord invite link (e.g., https://discord.gg/invitecode).');
    //     clanDiscordInput.focus();
    //     return;
    // }


    // --- If all checks pass, proceed with submission ---
    isSubmitting = true;
    submitClanBtn.disabled = true;
    submitClanBtn.textContent = isCreatingNewClan ? 'Creating...' : 'Updating...';
    // Record the time *before* the async call starts
    lastSubmitTimestamp = Date.now();

    try {
        // Gather form data
        const clanData = {
            id: clanIdInput.value || undefined, // Send ID only if updating, otherwise omit or send undefined/null based on API needs
            name: clanName,
            description: clanDescription,
            discord_link: clanDiscordInput.value.trim() || null, // Send null if empty? Check API requirements
            status: clanStatusInput.value,
            logo_url: clanLogoUrlInput.value || null,
            cover_image_url: clanCoverImageUrlInput.value || null,
            // !!! Crucial: Ensure your backend identifies the user (e.g., via session/token) !!!
            // owner_id: currentUser.id // DO NOT rely on sending this from client unless secured properly
        };

        console.log("Submitting Clan Data:", clanData);

        // --- !!! PLACEHOLDER: Replace with your actual API call (Create or Update) !!! ---
        const apiUrl = clanData.id ? `/api/clans/${clanData.id}` : '/api/clans';
        const method = clanData.id ? 'PUT' : 'POST';

        // Example using fetch:
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
        //    // Try to parse specific error message from backend
        //    let errorMessage = `HTTP error! status: ${response.status}`;
        //    try {
        //        const errorData = await response.json();
        //        errorMessage = errorData.message || errorData.error || errorMessage;
        //    } catch (parseError) { /* Ignore if response is not JSON */ }
        //    throw new Error(errorMessage);
        // }
        // const result = await response.json(); // Get created/updated clan data
        // console.log('API Success:', result);

        // Simulate API success for demonstration
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        const action = clanData.id ? 'updated' : 'created';
        console.log(`Simulated API Success: Clan ${action}`);
        displayFormMessage(`Clan ${action} successfully!`, false);
        // --- End Placeholder ---

        // Reset form and refresh list on success
        resetClanForm();
        if (currentUser) {
            await fetchUserClans(currentUser.id); // Refresh the list
        }

    } catch (error) {
        console.error('Clan submission error:', error);
        displayFormMessage(`Error: ${error.message || 'An unknown error occurred.'}`);
        // Don't reset the rate limit timestamp on failure, let the cooldown apply
    } finally {
        // Re-enable submission regardless of success/failure
        isSubmitting = false;
        submitClanBtn.disabled = false;
         // Reset button text, check if we are still in edit mode or create mode
        submitClanBtn.textContent = clanIdInput.value ? 'Update Clan' : 'Submit Clan';
    }
});

// --- Cancel Edit Listener ---
cancelEditBtn.addEventListener('click', (e) => {
    e.preventDefault();
    resetClanForm();
});

// --- User Clans List Listener (for Edit/Delete buttons - Event Delegation) ---
userClansList.addEventListener('click', (e) => {
    const editButton = e.target.closest('.edit-clan-btn');
    const deleteButton = e.target.closest('.delete-clan-btn');

    if (editButton) {
        const listItem = editButton.closest('li');
        if (listItem && listItem.dataset.clanData) {
            try {
                const clanData = JSON.parse(listItem.dataset.clanData);
                populateFormForEdit(clanData);
            } catch (jsonError) {
                console.error("Error parsing clan data for edit:", jsonError);
                displayFormMessage("Could not load clan data for editing.");
            }
        }
    } else if (deleteButton) {
        const clanId = deleteButton.dataset.clanId;
        if (clanId) {
            deleteClan(clanId);
        }
    }
});


// --- Real-time Word Count Feedback Listeners (Optional - requires HTML spans) ---
clanNameInput.addEventListener('input', () => {
    const words = countWords(clanNameInput.value);
    const feedbackEl = document.getElementById('clanNameWordCount'); // Add <span id="clanNameWordCount"> near input
    if (feedbackEl) {
         feedbackEl.textContent = `${words}/${MAX_CLAN_NAME_WORDS} words`;
         feedbackEl.style.color = words > MAX_CLAN_NAME_WORDS ? 'red' : 'inherit';
         feedbackEl.style.marginLeft = '10px'; // Add some spacing
    }
     // Clear general form validation errors when user types in a field
     if (formMessage.style.color === 'red') {
        clearFormMessage();
     }
});

clanDescriptionInput.addEventListener('input', () => {
    const words = countWords(clanDescriptionInput.value);
    const feedbackEl = document.getElementById('clanDescWordCount'); // Add <span id="clanDescWordCount"> near input
    if (feedbackEl) {
        feedbackEl.textContent = `${words}/${MAX_CLAN_DESC_WORDS} words`;
        feedbackEl.style.color = words > MAX_CLAN_DESC_WORDS ? 'red' : 'inherit';
        feedbackEl.style.marginLeft = '10px'; // Add some spacing
    }
    // Clear general form validation errors when user types in a field
     if (formMessage.style.color === 'red') {
        clearFormMessage();
     }
});


// ======================================================
//          Initialization
// ======================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("Profile script loaded. Checking login status...");
    resetClanForm(); // Ensure form is in default state initially
    checkLoginStatus(); // Check login and fetch initial data if logged in
});
