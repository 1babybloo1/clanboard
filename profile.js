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

// --- Cloudinary Configuration ---
const CLOUDINARY_CLOUD_NAME = "djttn4xvk"; // <--- REPLACE
const CLOUDINARY_UPLOAD_PRESET = "compmanage"; // <--- REPLACE

let currentUser = null;

// Function to initialize the profile page based on auth state
function loadUserProfile() {
    currentUser = auth.currentUser;
    if (currentUser) {
        profileContent.style.display = 'block';
        loginPrompt.style.display = 'none';
        welcomeMessage.textContent = `Welcome, ${currentUser.email}! Manage your clans below.`;
        resetForm(); // Ensure form is clear initially
        fetchUserClans();
    } else {
        profileContent.style.display = 'none';
        loginPrompt.style.display = 'block';
        if (userClansList) userClansList.innerHTML = ''; // Clear clan list if logged out
    }
}

// --- Cloudinary Upload Widget ---
const createUploadWidget = (options, callback) => {
    return cloudinary.createUploadWidget({
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        folder: 'poxel_clans', // Optional: organize uploads in Cloudinary
        // Add cropping, sources, etc. as needed
        ...options
    }, (error, result) => {
        if (!error && result && result.event === "success") {
            console.log('Done! Here is the image info: ', result.info);
            callback(result.info.secure_url); // Pass the secure URL back
        } else if (error) {
            console.error("Cloudinary Upload Error:", error);
            setFormMessage("Image upload failed. Please try again.", true);
        }
    });
};

// Setup widgets
const logoUploadWidget = createUploadWidget({ multiple: false }, (url) => {
    clanLogoUrlInput.value = url;
    logoPreview.src = url;
    logoPreview.style.border = 'none'; // Remove dashed border
});

const bannerUploadWidget = createUploadWidget({ multiple: false, cropping: true, croppingAspectRatio: 16/9 }, (url) => { // Example: enforce banner aspect ratio
    clanCoverImageUrlInput.value = url;
    bannerPreview.src = url;
     bannerPreview.style.border = 'none'; // Remove dashed border
});

// Add event listeners for upload buttons
if (uploadLogoBtn) {
    uploadLogoBtn.addEventListener('click', () => logoUploadWidget.open());
}
if (uploadBannerBtn) {
    uploadBannerBtn.addEventListener('click', () => bannerUploadWidget.open());
}

// --- Form Handling ---
function setFormMessage(message, isError = false) {
    if (!formMessage) return;
    formMessage.textContent = message;
    formMessage.className = isError ? 'error' : 'success';
    // Clear message after a few seconds
    setTimeout(() => {
         if (formMessage.textContent === message) { // Only clear if it's the same message
            formMessage.textContent = '';
            formMessage.className = '';
         }
    }, 5000);
}

function resetForm() {
    if (!clanForm) return;
    clanForm.reset();
    clanIdInput.value = ''; // Clear hidden ID
    clanLogoUrlInput.value = '';
    clanCoverImageUrlInput.value = '';
    logoPreview.src = ''; // Reset previews
    logoPreview.style.border = '1px dashed var(--gray)';
    bannerPreview.src = '';
    bannerPreview.style.border = '1px dashed var(--gray)';
    formTitle.textContent = 'Add Your Clan';
    submitClanBtn.textContent = 'Add Clan';
    submitClanBtn.disabled = false;
    cancelEditBtn.style.display = 'none'; // Hide cancel button
    formMessage.textContent = '';
    formMessage.className = '';
}

if (clanForm) {
    clanForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) {
            setFormMessage("You must be logged in to add/edit clans.", true);
            return;
        }

        submitClanBtn.disabled = true; // Prevent double submission
        setFormMessage("Submitting...", false);

        const clanData = {
            name: clanNameInput.value.trim(),
            description: clanDescriptionInput.value.trim(),
            link: clanDiscordInput.value.trim() || null, // Store null if empty
            status: clanStatusInput.value,
            logo: clanLogoUrlInput.value || null,
            coverImage: clanCoverImageUrlInput.value || null,
            userId: currentUser.uid, // Associate clan with user
            userEmail: currentUser.email, // Optional: store for display/debugging
             // Use server timestamp for creation/update time
             // For updates, we might want a separate 'updatedAt' field
             createdAt: firebase.firestore.FieldValue.serverTimestamp(),
             updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Basic validation (add more as needed)
        if (!clanData.name || !clanData.description) {
             setFormMessage("Clan Name and Description are required.", true);
             submitClanBtn.disabled = false;
             return;
        }
         // Consider adding validation for Discord link format if provided


        const editingClanId = clanIdInput.value;

        try {
            if (editingClanId) {
                // Update existing clan (merge to keep createdAt)
                // Remove createdAt from update data to avoid overwriting it
                delete clanData.createdAt;
                await clansCollection.doc(editingClanId).set(clanData, { merge: true });
                setFormMessage("Clan updated successfully!", false);
            } else {
                // Add new clan
                await clansCollection.add(clanData);
                setFormMessage("Clan added successfully!", false);
            }
            resetForm();
            fetchUserClans(); // Refresh the list
        } catch (error) {
            console.error("Error saving clan:", error);
            setFormMessage(`Error saving clan: ${error.message}`, true);
            submitClanBtn.disabled = false; // Re-enable button on error
        }
    });
}

// Cancel Edit Button
if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', resetForm);
}


// --- Fetch and Display User's Clans ---
async function fetchUserClans() {
    if (!userClansList || !currentUser) return;

     loadingClansMsg.style.display = 'block';
     userClansList.innerHTML = ''; // Clear previous list items only

    try {
        const querySnapshot = await clansCollection
            .where("userId", "==", currentUser.uid)
            .orderBy("createdAt", "desc")
            .get();

         loadingClansMsg.style.display = 'none'; // Hide loading message

        if (querySnapshot.empty) {
            userClansList.innerHTML = '<p style="color: var(--text-muted);">You haven\'t added any clans yet.</p>';
            return;
        }

        querySnapshot.forEach(doc => {
            const clan = { id: doc.id, ...doc.data() };
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div class="clan-info">
                    <img src="${clan.logo || 'https://via.placeholder.com/40/0F172A/FFFFFF?text=L'}" alt="${clan.name} Logo">
                    <span>${clan.name}</span>
                </div>
                <div class="clan-actions">
                    <button class="edit-btn" data-id="${clan.id}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="delete-btn" data-id="${clan.id}"><i class="fas fa-trash"></i> Delete</button>
                </div>
            `;

            // Add event listeners for edit/delete buttons
            listItem.querySelector('.edit-btn').addEventListener('click', () => populateFormForEdit(clan));
            listItem.querySelector('.delete-btn').addEventListener('click', () => deleteClan(clan.id, clan.name));

            userClansList.appendChild(listItem);
        });

    } catch (error) {
        console.error("Error fetching user clans:", error);
         loadingClansMsg.style.display = 'none';
        userClansList.innerHTML = '<p style="color: var(--danger);">Could not load your clans.</p>';
    }
}

// --- Edit Clan ---
function populateFormForEdit(clan) {
    if (!clanForm) return;
    resetForm(); // Clear any previous state

    clanIdInput.value = clan.id;
    clanNameInput.value = clan.name || '';
    clanDescriptionInput.value = clan.description || '';
    clanDiscordInput.value = clan.link || '';
    clanStatusInput.value = clan.status || 'Available for Requests (Includes Requirements)'; // Default if missing
    clanLogoUrlInput.value = clan.logo || '';
    clanCoverImageUrlInput.value = clan.coverImage || '';

    if (clan.logo) {
        logoPreview.src = clan.logo;
        logoPreview.style.border = 'none';
    }
     if (clan.coverImage) {
        bannerPreview.src = clan.coverImage;
        bannerPreview.style.border = 'none';
    }

    formTitle.textContent = `Edit Clan: ${clan.name}`;
    submitClanBtn.textContent = 'Update Clan';
    cancelEditBtn.style.display = 'inline-block'; // Show cancel button

    // Scroll to form for better UX
    clanForm.scrollIntoView({ behavior: 'smooth' });
}

// --- Delete Clan ---
async function deleteClan(id, name) {
    if (!confirm(`Are you sure you want to delete the clan "${name}"? This cannot be undone.`)) {
        return;
    }

    try {
        await clansCollection.doc(id).delete();
        console.log("Clan deleted:", id);
        setFormMessage(`Clan "${name}" deleted successfully.`, false);
        // If the deleted clan was being edited, reset the form
        if (clanIdInput.value === id) {
            resetForm();
        }
        fetchUserClans(); // Refresh the list
    } catch (error) {
        console.error("Error deleting clan:", error);
        setFormMessage(`Error deleting clan: ${error.message}`, true);
    }
}

// --- Initial Load ---
// Add listener to run loadUserProfile when the DOM is ready and auth state might be available
document.addEventListener('DOMContentLoaded', () => {
     // Initial check in case auth state is already known
     loadUserProfile();
     // The onAuthStateChanged listener in auth.js will also call loadUserProfile
     // when the state changes, ensuring the UI updates correctly after login/logout.
});

// Expose function globally if needed by auth.js or other scripts
window.loadUserProfile = loadUserProfile;
