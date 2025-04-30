// Wait for the DOM and Firebase config to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Ensure Firebase is initialized
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        console.error("Firebase not initialized. Ensure firebase-config.js is loaded first.");
        displayMessage('Firebase configuration error. Please try again later.', true);
        return;
    }

    const auth = firebase.auth();
    const db = firebase.firestore();

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
    const logoPreview = document.getElementById('logoPreview');
    const bannerPreview = document.getElementById('bannerPreview');
    const formMessage = document.getElementById('formMessage');
    const submitBtn = document.getElementById('submitBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const formTitle = document.getElementById('formTitle');
    const userClansGrid = document.getElementById('userClansGrid');
    const loadingUserClans = document.getElementById('loadingUserClans');
    const loginPrompt = document.getElementById('loginPrompt');
    const manageSection = document.getElementById('manageSection');

    // --- Configuration ---
    const CLOUDINARY_CLOUD_NAME = 'djttn4xvk'; // Replace with your Cloudinary cloud name
    const CLOUDINARY_UPLOAD_PRESET = 'compmanage'; // Replace with your unsigned upload preset name
    const SUBMISSION_COOLDOWN_HOURS = 24; // Cooldown in hours
    const MAX_NAME_WORDS = 1;
    const MAX_DESC_WORDS = 50;
    const BLACKLISTED_WORDS = ["nigger", "n1gger", "cunt",'shit','nazi','fuck']; // Add words (lowercase)

    let currentUser = null;
    let editingClanId = null; // Store the ID of the clan being edited

    // --- Authentication Check ---
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            console.log("User logged in:", user.uid);
            loginPrompt.style.display = 'none';
            manageSection.style.display = 'block';
            loadUserClans(user.uid); // Load clans once logged in
        } else {
            currentUser = null;
            console.log("User logged out or not logged in.");
            loginPrompt.style.display = 'block';
            manageSection.style.display = 'none';
            userClansGrid.innerHTML = ''; // Clear any previously loaded clans
             // Redirect to index page if trying to access submit page directly without login?
             // window.location.href = 'index.html'; // Optional: force redirect
        }
         // Update shared auth UI elements (like logout button visibility) handled by auth.js
         if (window.updateAuthUI) window.updateAuthUI(user);
    });


    // --- Cloudinary Widget Setup ---
    function createUploadWidget(buttonElement, urlInput, statusElement, previewElement) {
        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
             console.error("Cloudinary configuration (Cloud Name or Upload Preset) is missing!");
             statusElement.textContent = "Upload error: Config missing";
             statusElement.style.color = 'var(--danger)';
             buttonElement.disabled = true;
             return null;
        }

        const widget = cloudinary.createUploadWidget({
            cloudName: CLOUDINARY_CLOUD_NAME,
            uploadPreset: CLOUDINARY_UPLOAD_PRESET,
            sources: ["local", "url", "camera"],
            multiple: false,
            maxFileSize: 5000000, // 5MB limit example
            cropping: false, // Enable if you want cropping
            // croppingAspectRatio: 1, // For square logo?
            theme: "minimal", // Or "purple", "white", etc.
            styles: { // Optional: Style the widget
                palette: {
                    window: "#0F172A", // Dark background
                    sourceBg: "#1E293B",
                    windowBorder: "#6366F1",
                    tabIcon: "#FFFFFF",
                    inactiveTabIcon: "#94A3B8",
                    menuIcons: "#FFFFFF",
                    link: "#6366F1", // Primary color
                    action: "#A855F7", // Secondary color
                    inProgress: "#F59E0B", // Warning
                    complete: "#22C55E", // Success
                    error: "#EF4444", // Danger
                    textDark: "#F8FAFC",
                    textLight: "#CBD5E1"
                 },
                 fonts: {
                    default: "'Inter', sans-serif"
                 }
            }
        }, (error, result) => {
            if (!error && result && result.event === "success") {
                console.log('Upload successful: ', result.info);
                urlInput.value = result.info.secure_url; // Store the HTTPS URL
                statusElement.textContent = "Uploaded!";
                statusElement.style.color = 'var(--success)';
                if (previewElement) {
                     previewElement.src = result.info.secure_url;
                     previewElement.style.display = 'block';
                }
                 clearMessage(); // Clear any previous form errors
            } else if (error) {
                console.error("Cloudinary upload error:", error);
                statusElement.textContent = "Upload failed";
                statusElement.style.color = 'var(--danger)';
                displayMessage("Image upload failed. Please try again.", true);
            } else if (result && result.event === "display-changed"){
                 // Modal opened/closed - maybe useful for styling adjustments
            }
        });

        buttonElement.addEventListener('click', () => {
            widget.open();
        });

        return widget; // Return the widget instance if needed later
    }

    // Initialize widgets
    createUploadWidget(uploadLogoBtn, logoUrlInput, logoStatus, logoPreview);
    createUploadWidget(uploadBannerBtn, bannerUrlInput, bannerStatus, bannerPreview);

    // --- Form Handling ---
    clanForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default HTML form submission
        if (!currentUser) {
            displayMessage("You must be logged in to submit.", true);
            return;
        }
        clearMessage();
        setLoading(true);

        // Get data
        const clanData = {
            name: clanNameInput.value.trim(),
            description: clanDescriptionInput.value.trim(),
            link: clanDiscordInput.value.trim(),
            status: clanStatusInput.value,
            logo: logoUrlInput.value.trim(), // Use stored URL
            coverImage: bannerUrlInput.value.trim(), // Use stored URL
            userId: currentUser.uid, // Add owner's ID
            // `createdAt` will be set differently for new vs update
        };

        // --- Validation ---
        // 1. Word Count
        const nameWords = clanData.name.split(/\s+/).filter(Boolean).length; // Filter empty strings
        const descWords = clanData.description.split(/\s+/).filter(Boolean).length;
        if (nameWords > MAX_NAME_WORDS) {
            displayMessage(`Clan Name must be ${MAX_NAME_WORDS} word${MAX_NAME_WORDS > 1 ? 's' : ''} maximum.`, true);
            setLoading(false);
            return;
        }
        if (descWords > MAX_DESC_WORDS) {
            displayMessage(`Description must be ${MAX_DESC_WORDS} words maximum.`, true);
            setLoading(false);
            return;
        }
         // 2. Required fields (HTML handles some, but good to double-check)
         if (!clanData.name || !clanData.description || !clanData.link || !clanData.status) {
            displayMessage('Please fill in all required fields (Name, Description, Link, Status).', true);
            setLoading(false);
            return;
         }
        // 3. Basic Link check (more robust needed if required)
         try {
            new URL(clanData.link); // Check if it's a valid URL format
            if (!clanData.link.startsWith('https://discord.gg/')) {
                displayMessage('Please provide a valid Discord invite link (starting with https://discord.gg/).', true);
                 setLoading(false);
                 return;
            }
         } catch (_) {
            displayMessage('Please enter a valid URL for the Discord link.', true);
            setLoading(false);
            return;
         }

        // 4. Blacklisted Words (Client-Side)
         const combinedText = (clanData.name + " " + clanData.description).toLowerCase();
         for (const word of BLACKLISTED_WORDS) {
            if (combinedText.includes(word)) {
                displayMessage(`Submission contains a forbidden word ('${word}'). Please remove it.`, true);
                setLoading(false);
                return;
            }
         }

        try {
             // Check if we are editing or adding new
            editingClanId = editClanIdInput.value; // Get ID from hidden input

            if (editingClanId) {
                // --- UPDATE existing clan ---
                 clanData.updatedAt = firebase.firestore.FieldValue.serverTimestamp(); // Add update timestamp
                 // Remove userId and createdAt, should not be updated directly? Or keep createdAt? User choice.
                 // delete clanData.userId;
                 // delete clanData.createdAt; // Don't send createdAt in update if it shouldn't change

                 await db.collection('clans').doc(editingClanId).update(clanData);
                 displayMessage('Clan updated successfully!', false);
                 resetForm(); // Reset after successful update

            } else {
                // --- ADD new clan ---

                 // 5. Cooldown Check (before adding)
                const canSubmit = await checkCooldown(currentUser.uid);
                if (!canSubmit) {
                    displayMessage(`You can only submit one clan every ${SUBMISSION_COOLDOWN_HOURS} hours. Please wait.`, true, true); // Is info
                    setLoading(false);
                    return;
                }

                // Add server timestamp for creation
                 clanData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                 await db.collection('clans').add(clanData);
                 await updateLastSubmitTime(currentUser.uid); // Update cooldown timer *after* successful add
                 displayMessage('Clan submitted successfully!', false);
                 resetForm(); // Reset after successful submission
            }

            loadUserClans(currentUser.uid); // Refresh the list

        } catch (error) {
            console.error("Error saving clan:", error);
            displayMessage(`Error saving clan: ${error.message}`, true);
        } finally {
            setLoading(false);
        }
    });

     // --- Cooldown Logic ---
     async function checkCooldown(userId) {
         const userMetaRef = db.collection('userMetadata').doc(userId);
         try {
            const doc = await userMetaRef.get();
            if (!doc.exists || !doc.data()?.lastClanSubmit) {
                 return true; // No previous submission recorded
             }
            const lastSubmitTimestamp = doc.data().lastClanSubmit.toDate(); // Convert Firestore timestamp
             const cooldownEndTime = new Date(lastSubmitTimestamp.getTime() + SUBMISSION_COOLDOWN_HOURS * 60 * 60 * 1000);
             const now = new Date();

             if (now < cooldownEndTime) {
                 // Still in cooldown
                 const remainingMs = cooldownEndTime - now;
                 const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
                 const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
                 displayMessage(`Cooldown active. Please wait ${remainingHours}h ${remainingMinutes}m.`, true, true); // isInfo = true
                 return false;
             } else {
                 return true; // Cooldown passed
             }
         } catch (error) {
             console.error("Error checking cooldown:", error);
             displayMessage("Could not verify submission cooldown. Please try again.", true);
             return false; // Fail safe
         }
     }

     async function updateLastSubmitTime(userId) {
         const userMetaRef = db.collection('userMetadata').doc(userId);
         try {
             await userMetaRef.set({
                 lastClanSubmit: firebase.firestore.FieldValue.serverTimestamp()
             }, { merge: true }); // Use merge:true to not overwrite other potential metadata
             console.log("Updated last submit time for user:", userId);
         } catch (error) {
             console.error("Error updating last submit time:", error);
             // Don't necessarily block the user, but log it
             displayMessage("Could not update cooldown timer (clan was submitted).", true);
         }
     }


    // --- UI Helper Functions ---
    function displayMessage(msg, isError = false, isInfo = false) {
        formMessage.textContent = msg;
        formMessage.className = 'form-message'; // Reset classes
        if (isError) {
            formMessage.classList.add('error-message');
        } else if (isInfo) {
            formMessage.classList.add('info-message');
        } else {
             formMessage.classList.add('success-message');
        }
         formMessage.classList.remove('hidden');
    }

    function clearMessage() {
        formMessage.textContent = '';
        formMessage.classList.add('hidden');
    }

    function setLoading(isLoading) {
        submitBtn.disabled = isLoading;
        submitBtn.textContent = isLoading ? 'Processing...' : (editingClanId ? 'Update Clan' : 'Add Clan');
         // Maybe disable other form elements too
         clanNameInput.disabled = isLoading;
         clanDescriptionInput.disabled = isLoading;
         // etc.
    }

     function resetForm() {
         clanForm.reset(); // Resets all form fields to default values
         logoUrlInput.value = '';
         bannerUrlInput.value = '';
         logoStatus.textContent = 'No logo uploaded';
         logoStatus.style.color = 'var(--text-muted)';
         bannerStatus.textContent = 'No banner uploaded';
         bannerStatus.style.color = 'var(--text-muted)';
         logoPreview.style.display = 'none';
         logoPreview.src = '';
         bannerPreview.style.display = 'none';
         bannerPreview.src = '';
         editClanIdInput.value = ''; // Clear editing ID
         editingClanId = null;
         formTitle.textContent = 'Add Your Clan'; // Reset title
         submitBtn.textContent = 'Add Clan';
         cancelEditBtn.style.display = 'none'; // Hide cancel button
         clearMessage();
         setLoading(false); // Ensure button is re-enabled
     }

    // Cancel Edit Button Logic
    cancelEditBtn.addEventListener('click', resetForm);


    // --- Display User's Clans ---
    async function loadUserClans(userId) {
        if (!userId) {
            userClansGrid.innerHTML = '<p style="grid-column: 1 / -1; color: var(--text-muted); text-align: center;">Please log in to see your clans.</p>';
            loadingUserClans.style.display = 'none';
            return;
        }
        loadingUserClans.style.display = 'block';
        userClansGrid.innerHTML = ''; // Clear previous

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
             userClansGrid.innerHTML = `<p class="empty-results error-message" style="grid-column: 1 / -1;">Error loading your clans: ${error.message}</p>`;
        } finally {
            loadingUserClans.style.display = 'none';
        }
    }

    function createUserClanCard(clan) {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-id', clan.id);

        const dateAdded = clan.createdAt?.toDate ? formatRelativeDate(clan.createdAt.toDate()) : 'Unknown Date';
        const logoSrc = clan.logo || 'https://via.placeholder.com/40/0F172A/FFFFFF?text=L';
        const coverSrc = clan.coverImage || 'https://via.placeholder.com/300x180/1E293B/94A3B8?text=No+Banner';
        const statusDotClass = getStatusDotClass(clan.status); // Reuse function from main.js if available, or copy here

        card.innerHTML = `
            <img class="card-image" src="${coverSrc}" alt="${clan.name || 'Clan Banner'}" loading="lazy">
            <div class="card-content">
                <div class="card-title">
                    <img src="${logoSrc}" alt="${clan.name || 'Clan'} logo" loading="lazy">
                    <h3>${clan.name || 'Unnamed Clan'}</h3>
                </div>
                <p class="card-description">${clan.description || 'No description.'}</p>
                 <!-- No external join button here -->
                 <div class="card-stats">
                     <div class="online-count">
                         <div class="${statusDotClass}"></div>
                         ${clan.status || 'Status Unknown'}
                     </div>
                     <div class="date-added">${dateAdded}</div>
                 </div>
                 <div class="card-actions">
                     <button class="action-button edit-button" data-id="${clan.id}"><i class="fas fa-edit"></i> Edit</button>
                     <button class="action-button delete-button" data-id="${clan.id}"><i class="fas fa-trash"></i> Delete</button>
                 </div>
            </div>
        `;

         // Add event listeners for edit/delete buttons within this card
         const editBtn = card.querySelector('.edit-button');
         const deleteBtn = card.querySelector('.delete-button');

         editBtn.addEventListener('click', () => handleEdit(clan.id));
         deleteBtn.addEventListener('click', () => handleDelete(clan.id, clan.name));


        return card;
    }

    // --- Edit and Delete Logic ---
    async function handleEdit(clanId) {
         console.log("Editing clan:", clanId);
         clearMessage();
         // Fetch the clan data
         try {
             const doc = await db.collection('clans').doc(clanId).get();
             if (!doc.exists) {
                 displayMessage("Clan not found. It might have been deleted.", true);
                 return;
             }
             const clan = doc.data();

             // Populate the form
             clanNameInput.value = clan.name || '';
             clanDescriptionInput.value = clan.description || '';
             clanDiscordInput.value = clan.link || '';
             clanStatusInput.value = clan.status || ''; // Make sure status values match <option> values
             logoUrlInput.value = clan.logo || '';
             bannerUrlInput.value = clan.coverImage || '';
             editClanIdInput.value = clanId; // Set the hidden ID field
             editingClanId = clanId; // Also update the global tracker variable

             // Update UI for image previews and status
             logoStatus.textContent = clan.logo ? "Logo uploaded" : "No logo uploaded";
             logoStatus.style.color = clan.logo ? 'var(--success)' : 'var(--text-muted)';
             bannerStatus.textContent = clan.coverImage ? "Banner uploaded" : "No banner uploaded";
             bannerStatus.style.color = clan.coverImage ? 'var(--success)' : 'var(--text-muted)';

             if (clan.logo) {
                 logoPreview.src = clan.logo;
                 logoPreview.style.display = 'block';
             } else {
                 logoPreview.style.display = 'none';
                 logoPreview.src = '';
             }
              if (clan.coverImage) {
                 bannerPreview.src = clan.coverImage;
                 bannerPreview.style.display = 'block';
             } else {
                 bannerPreview.style.display = 'none';
                 bannerPreview.src = '';
             }

             // Change button text and show cancel button
             formTitle.textContent = `Editing Clan: ${clan.name}`;
             submitBtn.textContent = 'Update Clan';
             cancelEditBtn.style.display = 'block';

             // Scroll to the form for better UX
             clanForm.scrollIntoView({ behavior: 'smooth' });

         } catch (error) {
             console.error("Error fetching clan for edit:", error);
             displayMessage("Failed to load clan data for editing.", true);
         }
     }

     async function handleDelete(clanId, clanName) {
        console.log("Deleting clan:", clanId);
        if (!window.confirm(`Are you sure you want to delete the clan "${clanName || 'this clan'}"? This cannot be undone.`)) {
            return; // User cancelled
        }

        // Show loading state maybe?
         // setLoading(true); // If you want to disable form while deleting?

         try {
             await db.collection('clans').doc(clanId).delete();
             displayMessage(`Clan "${clanName}" deleted successfully.`, false);
             // Optionally add success message near the grid
             // Remove the card from the UI directly for faster feedback
              const cardToRemove = userClansGrid.querySelector(`.card[data-id="${clanId}"]`);
             if (cardToRemove) {
                 cardToRemove.remove();
             }
              // Or just reload the whole list:
             // loadUserClans(currentUser.uid);
              // Check if the grid is now empty
              if (!userClansGrid.hasChildNodes() || userClansGrid.querySelectorAll('.card').length === 0) {
                 userClansGrid.innerHTML = '<p class="empty-results" style="grid-column: 1 / -1;"><i class="fas fa-box-open"></i><br>You haven\'t added any clans yet.</p>';
              }

         } catch (error) {
             console.error("Error deleting clan:", error);
             displayMessage(`Failed to delete clan: ${error.message}`, true);
             // Handle error near the specific card or general message
         } finally {
            // setLoading(false);
             resetForm(); // If user was editing this clan, reset the form
         }
    }


     // --- Utility functions needed by createUserClanCard ---
     // Copy/paste from main.js or import if using modules
     function formatRelativeDate(date) {
         if (!date || !(date instanceof Date)) return "Unknown Date";
         const now = new Date();
         const diffInMs = now - date;
         const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

         if (diffInMs < 0) return date.toLocaleDateString();
         if (diffInDays === 0) {
             const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
             if (diffInHours < 1) return "Just now";
             if (diffInHours < now.getHours()) return `${diffInHours}h ago`;
             return "Today";
         }
         if (diffInDays === 1) return "Yesterday";
         if (diffInDays < 7) return `${diffInDays}d ago`;
         return date.toLocaleDateString();
     }

     function getStatusDotClass(status) {
         status = status || "";
         const statusLower = status.toLowerCase();
         if (statusLower.includes("open")) return "status-dot-open";
         if (statusLower.includes("available") || statusLower.includes("requests")) return "status-dot-requests";
         return "status-dot-closed";
     }

}); // End DOMContentLoaded
