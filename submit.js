// submit.js - Logic for the Clan Submission and Management Page

// Wait for the DOM and Firebase config to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Ensure Firebase is initialized
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        console.error("Submit.js: Firebase not initialized. Ensure firebase-config.js is loaded first.");
        // Attempt to display an error message within the designated area if possible
        const msgElement = document.getElementById('formMessage') || document.getElementById('loginPrompt');
        if (msgElement) {
            msgElement.textContent = 'System Error: Cannot connect to Firebase services.';
            msgElement.className = 'form-message error-message';
            msgElement.style.display = 'block';
        }
        // Hide main section if Firebase fails
        const manageSection = document.getElementById('manageSection');
        if(manageSection) manageSection.style.display = 'none';
        return; // Stop script execution
    }

    // --- Get Firebase Services ---
    const auth = firebase.auth();
    const db = firebase.firestore();
    // Optionally get Functions if you start implementing server-side calls
    // const functions = firebase.functions(); // Use if calling cloud functions

    // --- DOM Elements ---
    const clanForm = document.getElementById('clanForm');
    const clanNameInput = document.getElementById('clanName');
    const clanDescriptionInput = document.getElementById('clanDescription');
    const clanDiscordInput = document.getElementById('clanDiscord');
    const clanStatusInput = document.getElementById('clanStatus');
    const logoUrlInput = document.getElementById('logoUrl');
    const bannerUrlInput = document.getElementById('bannerUrl');
    const editClanIdInput = document.getElementById('editClanId'); // Hidden input
    const uploadLogoBtn = document.getElementById('uploadLogoBtn');
    const uploadBannerBtn = document.getElementById('uploadBannerBtn');
    const logoStatus = document.getElementById('logoStatus');
    const bannerStatus = document.getElementById('bannerStatus');
    const logoPreview = document.getElementById('logoPreview'); // Correct ID
    const bannerPreview = document.getElementById('bannerPreview'); // Correct ID
    const formMessage = document.getElementById('formMessage');
    const submitBtn = document.getElementById('submitBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const formTitle = document.getElementById('formTitle');
    const userClansGrid = document.getElementById('userClansGrid');
    const loadingUserClans = document.getElementById('loadingUserClans');
    const loginPrompt = document.getElementById('loginPrompt'); // Div shown if not logged in
    const manageSection = document.getElementById('manageSection'); // Div containing form and user clans

    // --- Configuration ---
    const CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUD_NAME'; // Replace with your Cloudinary cloud name
    const CLOUDINARY_UPLOAD_PRESET = 'YOUR_UNSIGNED_PRESET'; // Replace with your unsigned upload preset name
    const SUBMISSION_COOLDOWN_HOURS = 24; // Cooldown in hours
    const MAX_NAME_WORDS = 1;
    const MAX_DESC_WORDS = 50;
    // Add your specific blacklisted words here (lowercase)
    const BLACKLISTED_WORDS = ["badword1", "example", "spam"];

    // --- State Variables ---
    let currentUser = null;
    let editingClanId = null; // Store the ID of the clan being edited


    // --- Authentication Check ---
    auth.onAuthStateChanged(user => {
        currentUser = user; // Store the user object
        if (user) {
            // User is logged in
            console.log("Submit.js: User logged in -", user.uid);
            if(loginPrompt) loginPrompt.style.display = 'none';
            if(manageSection) manageSection.style.display = 'block';
            // Initialize features for logged-in user
            initializeCloudinaryWidgets(); // Setup uploads
            loadUserClans(user.uid); // Load their clans

        } else {
            // User is logged out or not logged in yet
            console.log("Submit.js: User logged out or not logged in.");
            if(loginPrompt) loginPrompt.style.display = 'block';
            if(manageSection) manageSection.style.display = 'none';
            if(userClansGrid) userClansGrid.innerHTML = ''; // Clear user clans grid
            resetForm(); // Reset form fields if user logs out
        }

        // Update general UI (like logout button visibility) managed by auth.js potentially
        // This assumes auth.js exists and exposes this function globally. Check console if errors occur.
        // if (window.updateAuthUI) window.updateAuthUI(user); // Calls the function from auth.js if available
    });


    // --- Cloudinary Widget Setup Function ---
    function initializeCloudinaryWidgets() {
        // Ensure setup runs only once and required buttons exist
         if (initializeCloudinaryWidgets.initialized || !uploadLogoBtn || !uploadBannerBtn) return;
         initializeCloudinaryWidgets.initialized = true; // Flag to prevent re-init

        const createWidget = (buttonElement, urlInput, statusElement, previewElement) => {
            if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
                 console.error("Cloudinary configuration (Cloud Name or Upload Preset) is missing!");
                 if (statusElement) {
                    statusElement.textContent = "Upload error: Config missing";
                     statusElement.style.color = 'var(--danger)';
                 }
                 if(buttonElement) buttonElement.disabled = true;
                 return null;
            }
             // Check if widget already attached to button to prevent duplicates
            if (buttonElement.cloudinaryWidgetInstance) {
                 return buttonElement.cloudinaryWidgetInstance;
            }

             const widget = cloudinary.createUploadWidget({
                 cloudName: CLOUDINARY_CLOUD_NAME,
                 uploadPreset: CLOUDINARY_UPLOAD_PRESET,
                 sources: ["local", "url"], // Simplified sources
                 multiple: false,
                 maxFileSize: 5000000, // 5MB limit example
                 theme: "minimal",
                 styles: { /* ... Your styles from before if needed ... */ }
            }, (error, result) => {
                if (!error && result && result.event === "success") {
                     console.log('Upload successful: ', result.info.secure_url);
                     urlInput.value = result.info.secure_url; // Store URL
                     statusElement.textContent = "Uploaded!";
                     statusElement.style.color = 'var(--success)';
                     if (previewElement) {
                         previewElement.src = result.info.secure_url;
                         previewElement.style.display = 'block';
                     }
                     clearMessage();
                 } else if (error) {
                     console.error("Cloudinary upload error:", error);
                     statusElement.textContent = "Upload failed";
                     statusElement.style.color = 'var(--danger)';
                     displayMessage("Image upload failed.", true);
                 }
             });

             buttonElement.addEventListener('click', () => widget.open());
             buttonElement.cloudinaryWidgetInstance = widget; // Store instance on button
             return widget;
        };

         // Initialize widgets for logo and banner upload buttons
         if(uploadLogoBtn) createWidget(uploadLogoBtn, logoUrlInput, logoStatus, logoPreview);
         if(uploadBannerBtn) createWidget(uploadBannerBtn, bannerUrlInput, bannerStatus, bannerPreview);
    }
    // Call initialization - Note: Auth listener also calls this ensure it happens upon login
    initializeCloudinaryWidgets();

    // --- Form Submission Handler ---
    if (clanForm) {
        clanForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentUser) {
                displayMessage("You must be logged in to submit.", true);
                return;
            }
            clearMessage();
            setLoading(submitBtn, true);

            // --- Gather Form Data ---
            const clanData = {
                name: clanNameInput.value.trim(),
                description: clanDescriptionInput.value.trim(),
                link: clanDiscordInput.value.trim(),
                status: clanStatusInput.value,
                logo: logoUrlInput.value.trim(),
                coverImage: bannerUrlInput.value.trim(),
                userId: currentUser.uid, // Set owner ID
            };

             // --- Client-Side Validation (Keep basic checks) ---
            // These would be REPLACED or SUPPLEMENTED by Cloud Function checks
            const nameWords = clanData.name.split(/\s+/).filter(Boolean).length;
            const descWords = clanData.description.split(/\s+/).filter(Boolean).length;
            const combinedText = (clanData.name + " " + clanData.description).toLowerCase();

            if (!clanData.name || !clanData.description || !clanData.link || !clanData.status) {
                 displayMessage('Please fill in all required fields.', true);
                 setLoading(submitBtn, false, editClanIdInput.value ? 'Update Clan' : 'Add Clan'); return;
             }
            if (nameWords > MAX_NAME_WORDS) {
                 displayMessage(`Name must be ${MAX_NAME_WORDS} word(s) max.`, true); setLoading(submitBtn, false, editClanIdInput.value ? 'Update Clan' : 'Add Clan'); return;
             }
            if (descWords > MAX_DESC_WORDS) {
                 displayMessage(`Description must be ${MAX_DESC_WORDS} words max.`, true); setLoading(submitBtn, false, editClanIdInput.value ? 'Update Clan' : 'Add Clan'); return;
            }
             try {
                const url = new URL(clanData.link); // Basic URL format check
                 if (!url.protocol.startsWith("https") || url.hostname !== 'discord.gg') {
                    displayMessage('Link must be a valid https://discord.gg/ invite.', true); setLoading(submitBtn, false, editClanIdInput.value ? 'Update Clan' : 'Add Clan'); return;
                 }
             } catch (_) {
                 displayMessage('Invalid Discord link format.', true); setLoading(submitBtn, false, editClanIdInput.value ? 'Update Clan' : 'Add Clan'); return;
            }
            for (const word of BLACKLISTED_WORDS) {
                 if (combinedText.includes(word)) {
                    displayMessage(`Submission contains a forbidden word: '${word}'.`, true); setLoading(submitBtn, false, editClanIdInput.value ? 'Update Clan' : 'Add Clan'); return;
                }
             }

            // --- Action: Add or Update ---
            editingClanId = editClanIdInput.value; // Get current editing ID (if any)

            try {
                if (editingClanId) {
                     // --- UPDATE ---
                    console.log("Attempting to update clan:", editingClanId);
                    clanData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                    // Remove userId, it should not be updated. Already assigned on create.
                    delete clanData.userId;

                    await db.collection('clans').doc(editingClanId).update(clanData);
                    displayMessage('Clan updated successfully!', false);
                    resetForm();
                    loadUserClans(currentUser.uid); // Refresh user's clan list

                } else {
                    // --- ADD NEW ---
                    console.log("Attempting to add new clan");
                     // --- Client-Side Cooldown Check (Replace with Cloud Function check later) ---
                     const canSubmit = await checkCooldown(currentUser.uid);
                     if (!canSubmit) {
                         // Error message already displayed by checkCooldown
                         setLoading(submitBtn, false, 'Add Clan');
                         return;
                     }
                    // --- End Cooldown Check ---

                    clanData.createdAt = firebase.firestore.FieldValue.serverTimestamp(); // Set creation time
                    // userId is already in clanData
                    const docRef = await db.collection('clans').add(clanData);
                    console.log("Clan added with ID: ", docRef.id);
                    await updateLastSubmitTime(currentUser.uid); // Record submission time *after* success
                    displayMessage('Clan submitted successfully!', false);
                    resetForm();
                    loadUserClans(currentUser.uid); // Refresh list
                }

            } catch (error) {
                console.error("Error saving clan:", error);
                // Check for permission errors specifically
                 if (error.code === 'permission-denied') {
                    displayMessage('Error: Permission denied. Check Firestore rules or server function logs.', true);
                 } else {
                     displayMessage(`Error saving clan: ${error.message}.`, true);
                 }
                 setLoading(submitBtn, false, editingClanId ? 'Update Clan' : 'Add Clan');
            }

            // setLoading(submitBtn, false); // Moved setting this inside try/catch/finally might be better
        });
    }

    // --- Client-Side Cooldown Logic (To be replaced by Cloud Function logic) ---
     async function checkCooldown(userId) {
         const userMetaRef = db.collection('userMetadata').doc(userId);
         try {
             const doc = await userMetaRef.get();
             if (doc.exists && doc.data()?.lastClanSubmit) {
                 const lastSubmit = doc.data().lastClanSubmit.toDate();
                 const cooldownEnds = new Date(lastSubmit.getTime() + SUBMISSION_COOLDOWN_HOURS * 60 * 60 * 1000);
                 if (new Date() < cooldownEnds) {
                     const remainingMs = cooldownEnds - new Date();
                     const hours = Math.floor(remainingMs / 3.6e6);
                     const mins = Math.floor((remainingMs % 3.6e6) / 6e4);
                     displayMessage(`Cooldown active. Please wait ${hours}h ${mins}m.`, true, true); // isInfo = true
                     return false;
                 }
             }
             return true; // No record or cooldown passed
         } catch (error) {
             console.error("Cooldown check error:", error);
             displayMessage("Could not verify cooldown. Please try again.", true);
             return false; // Fail safe
         }
     }
    async function updateLastSubmitTime(userId) {
         const userMetaRef = db.collection('userMetadata').doc(userId);
         try {
             await userMetaRef.set({
                 lastClanSubmit: firebase.firestore.FieldValue.serverTimestamp()
             }, { merge: true }); // merge:true avoids overwriting other potential metadata
         } catch (error) {
             console.error("Error updating submit time:", error);
             // Non-critical, log but don't necessarily block user
         }
    }
     // --- End Client-Side Cooldown Logic ---

    // --- UI Helper Functions ---
    function displayMessage(msg, isError = false, isInfo = false) {
         if (!formMessage) return;
         formMessage.textContent = msg;
         formMessage.className = 'form-message'; // Reset
         if (isError) formMessage.classList.add('error-message');
         else if (isInfo) formMessage.classList.add('info-message');
         else formMessage.classList.add('success-message');
         formMessage.style.display = 'block'; // Make visible
         formMessage.classList.remove('hidden'); // Just in case
    }
    function clearMessage() {
         if (!formMessage) return;
         formMessage.textContent = '';
         formMessage.style.display = 'none';
         formMessage.classList.add('hidden'); // Hide it properly
    }
    function setLoading(button, isLoading, loadingText = "Processing...") {
         if (!button) return;
         const defaultText = button.dataset.defaultText || (editingClanId ? 'Update Clan' : 'Add Clan');
         if (!button.dataset.defaultText) button.dataset.defaultText = defaultText; // Store default

         button.disabled = isLoading;
         button.textContent = isLoading ? loadingText : defaultText;
    }
     function resetForm() {
        if (clanForm) clanForm.reset();
         if(logoUrlInput) logoUrlInput.value = '';
         if(bannerUrlInput) bannerUrlInput.value = '';
         if(logoStatus) { logoStatus.textContent = 'No logo uploaded'; logoStatus.style.color = 'var(--text-muted)'; }
         if(bannerStatus) { bannerStatus.textContent = 'No banner uploaded'; bannerStatus.style.color = 'var(--text-muted)'; }
         if(logoPreview) { logoPreview.style.display = 'none'; logoPreview.src = ''; }
         if(bannerPreview) { bannerPreview.style.display = 'none'; bannerPreview.src = ''; }
         if(editClanIdInput) editClanIdInput.value = '';
         editingClanId = null;
         if(formTitle) formTitle.textContent = 'Add Your Clan';
         if(submitBtn) setLoading(submitBtn, false); // Ensure button is reset correctly
         if(cancelEditBtn) cancelEditBtn.style.display = 'none';
         clearMessage();
         // Optional: re-enable upload buttons if disabled
          if(uploadLogoBtn) uploadLogoBtn.disabled = false;
          if(uploadBannerBtn) uploadBannerBtn.disabled = false;
    }
    // Attach reset logic to cancel button
    if(cancelEditBtn) cancelEditBtn.addEventListener('click', resetForm);


    // --- Display User's Clans ---
    async function loadUserClans(userId) {
         if (!userId || !userClansGrid) return;
         if(loadingUserClans) loadingUserClans.style.display = 'block';
         userClansGrid.innerHTML = ''; // Clear current grid

         try {
             const snapshot = await db.collection('clans')
                                    .where('userId', '==', userId)
                                    .orderBy('createdAt', 'desc')
                                    .get();

             if (snapshot.empty) {
                 userClansGrid.innerHTML = '<p class="empty-results" style="grid-column: 1 / -1;"><i class="fas fa-box-open"></i><br>You haven\'t added any clans yet.</p>';
             } else {
                 snapshot.forEach(doc => {
                     const clan = { id: doc.id, ...doc.data() };
                     const card = createUserClanCard(clan);
                     userClansGrid.appendChild(card);
                 });
             }
         } catch (error) {
             console.error("Error loading user clans:", error);
             userClansGrid.innerHTML = `<p class="empty-results error-message" style="grid-column: 1 / -1;">Could not load your clans.</p>`;
         } finally {
             if(loadingUserClans) loadingUserClans.style.display = 'none';
         }
    }

     function createUserClanCard(clan) {
         const card = document.createElement('div');
         card.className = 'card';
         card.setAttribute('data-id', clan.id); // Set data-id for easy targeting

         // Use utility functions for formatting date and status
         const dateAdded = formatRelativeDate(clan.createdAt?.toDate());
         const statusDotClass = getStatusDotClass(clan.status);

         const logoSrc = clan.logo || 'https://via.placeholder.com/40/1E293B/FFFFFF?text=-';
         const coverSrc = clan.coverImage || 'https://via.placeholder.com/300x160/1E293B/94A3B8?text=No+Banner';

         card.innerHTML = `
             <img class="card-image" src="${coverSrc}" alt="${clan.name || 'Clan'} Banner" loading="lazy">
             <div class="card-content">
                 <div class="card-title">
                     <img src="${logoSrc}" alt="${clan.name || 'Clan'} logo" loading="lazy">
                     <h3>${clan.name || 'Unnamed Clan'}</h3>
                 </div>
                 <p class="card-description">${clan.description || 'No description.'}</p>
                 <div class="card-stats">
                     <div class="online-count">
                         <div class="${statusDotClass}"></div>
                         <span>${clan.status || 'Unknown'}</span> <!-- Wrap text in span for better control -->
                     </div>
                     <div class="date-added">${dateAdded}</div>
                 </div>
                 <div class="card-actions">
                     <button class="action-button edit-button" data-id="${clan.id}"><i class="fas fa-edit"></i> Edit</button>
                     <button class="action-button delete-button" data-id="${clan.id}"><i class="fas fa-trash"></i> Delete</button>
                 </div>
             </div>
         `;

         // Add event listeners to the buttons INSIDE this card
         card.querySelector('.edit-button').addEventListener('click', () => handleEdit(clan));
         card.querySelector('.delete-button').addEventListener('click', () => handleDelete(clan.id, clan.name));

         return card;
    }

    // --- Edit and Delete Logic ---
    function handleEdit(clan) { // Pass the whole clan object
        console.log("Editing clan:", clan.id, clan.name);
         clearMessage(); // Clear any previous form messages

         // Ensure all form elements exist before trying to populate
        if (!clanForm || !editClanIdInput || !clanNameInput || !clanDescriptionInput || !clanDiscordInput || !clanStatusInput || !logoUrlInput || !bannerUrlInput) {
             console.error("Cannot edit: Form elements missing from page.");
             displayMessage("Error preparing edit form.", true);
            return;
        }

        // --- Populate Form ---
         editClanIdInput.value = clan.id; // Critical: set the hidden ID
         editingClanId = clan.id; // Update state variable
         clanNameInput.value = clan.name || '';
         clanDescriptionInput.value = clan.description || '';
         clanDiscordInput.value = clan.link || '';
         clanStatusInput.value = clan.status || '';
         logoUrlInput.value = clan.logo || '';
         bannerUrlInput.value = clan.coverImage || '';

         // Update image previews and status text
         updateImagePreview(logoPreview, logoUrlInput.value, logoStatus, "Logo uploaded");
         updateImagePreview(bannerPreview, bannerUrlInput.value, bannerStatus, "Banner uploaded");

        // Change UI state for editing
         if (formTitle) formTitle.textContent = `Editing: ${clan.name}`;
         if (submitBtn) setLoading(submitBtn, false, 'Update Clan'); // Change button text via setLoading
         if (cancelEditBtn) cancelEditBtn.style.display = 'block'; // Show cancel button

         // Scroll to form
         if(clanForm) clanForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Helper for updating image previews and status
    function updateImagePreview(previewEl, url, statusEl, successText) {
         if (!previewEl || !statusEl) return;
         if (url) {
             previewEl.src = url;
             previewEl.style.display = 'block';
             statusEl.textContent = successText;
             statusEl.style.color = 'var(--success)';
         } else {
             previewEl.src = '';
             previewEl.style.display = 'none';
             statusEl.textContent = 'No image uploaded';
             statusEl.style.color = 'var(--text-muted)';
         }
     }


    async function handleDelete(clanId, clanName) {
         console.log("Deleting clan:", clanId, clanName);
         if (!currentUser) {
             displayMessage("Login required to delete.", true); return;
         }
         // Use clanName if available, otherwise default text
         const confirmMessage = `Are you sure you want to delete the clan "${clanName || 'this clan'}"? This cannot be undone.`;

         if (!window.confirm(confirmMessage)) {
            return; // User clicked Cancel
         }

         // Optionally disable buttons or show loading indicator on the card
         const cardToDelete = userClansGrid.querySelector(`.card[data-id="${clanId}"]`);
         if (cardToDelete) {
             cardToDelete.style.opacity = '0.5'; // Example visual feedback
             cardToDelete.querySelectorAll('button').forEach(btn => btn.disabled = true);
         }

         try {
             await db.collection('clans').doc(clanId).delete();
             console.log(`Clan ${clanId} deleted successfully.`);
              // Display success temporarily if needed, e.g., near the grid or in the main form message area
             // displayMessage(`Clan "${clanName}" deleted.`, false); // Use form message area
              // Remove the card from the UI immediately
             if (cardToDelete) cardToDelete.remove();

             // If the form was in edit mode for the deleted clan, reset it
             if (editClanIdInput.value === clanId) {
                 resetForm();
             }
              // Check if grid is now empty
             if (userClansGrid && !userClansGrid.querySelector('.card')) {
                 userClansGrid.innerHTML = '<p class="empty-results" style="grid-column: 1 / -1;"><i class="fas fa-box-open"></i><br>You haven\'t added any clans yet.</p>';
             }

         } catch (error) {
             console.error("Error deleting clan:", clanId, error);
             displayMessage(`Error deleting clan: ${error.message}`, true);
              // Restore card appearance if deletion failed
             if (cardToDelete) {
                 cardToDelete.style.opacity = '1';
                 cardToDelete.querySelectorAll('button').forEach(btn => btn.disabled = false);
             }
         }
     }


     // --- Date/Status Utility functions (needed for createUserClanCard) ---
     function formatRelativeDate(date) {
         if (!date || !(date instanceof Date)) return "Unknown"; // Needs a Date object
         const now = new Date();
         const diffMs = now - date;
         const diffDays = Math.floor(diffMs / 86400000); // days
         const diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
         const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes

         if (diffDays > 7) return date.toLocaleDateString(); // Older than a week
         if (diffDays > 1) return `${diffDays} days ago`;
         if (diffDays === 1) return "Yesterday";
         if (diffHrs > 1) return `${diffHrs} hours ago`;
         if (diffHrs === 1) return "1 hour ago";
         if (diffMins > 1) return `${diffMins} mins ago`;
         return "Just now";
     }
     function getStatusDotClass(status) {
         const s = (status || "").toLowerCase();
         if (s.includes("open")) return "status-dot-open";
         if (s.includes("request") || s.includes("available")) return "status-dot-requests";
         if (s.includes("closed") || s.includes("invite")) return "status-dot-closed";
         return "status-dot-closed"; // Default
    }

// --- IMPORTANT: Make sure this closing brace matches the opening one for DOMContentLoaded ---
});
