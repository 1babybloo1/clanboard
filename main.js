/**
 * main.js
 * Handles fetching, filtering, and rendering clan data.
 */

// --- Global Variables & DOM Elements ---
const clansGrid = document.getElementById('clansGrid');
const searchInput = document.getElementById('searchInput');

let db; // Firestore database instance
let clansCollection; // Firestore 'clans' collection reference
let searchDebounceTimer; // Timer for debouncing search input

// --- Hardcoded Clan Data ---
// Ensure dateAdded is a JavaScript Date object
const hardcodedClans = [
    {
        id: 'hc-1', name: "MYTH", logo: "https://res.cloudinary.com/djttn4xvk/image/upload/v1744798245/image_1_gthnh9.png", description: "Myth is the one of the most prestigious and innovative clans out there. Myth is certainly a great pick to join! Master your talent and climb your way to the top of the leaderboard! MYTH ON TOP!", status: "Available for Requests (Includes Requirements)", link: "https://discord.gg/4CWsuHdgzN", coverImage: "https://res.cloudinary.com/djttn4xvk/image/upload/v1744798245/image_1_gthnh9.png", dateAdded: new Date("2025-03-13"), isHardcoded: true
    },
    {
        id: 'hc-2', name: "SSL", logo: "https://res.cloudinary.com/djttn4xvk/image/upload/v1742231812/image_2025-03-17_171650661_lpdtm0.png", description: "An original clan made by Ssslick back in the good ol' days! This clan is for developers and top tier goats!", status: "Closed Clan", link: "", coverImage: "https://res.cloudinary.com/djttn4xvk/image/upload/v1742231805/image_2025-03-17_171643136_ker0vn.png", dateAdded: new Date("2025-03-15"), isHardcoded: true
    },
    {
        id: 'hc-3', name: "ONI", logo: "https://res.cloudinary.com/djttn4xvk/image/upload/v1742231865/image_2025-03-17_171737081_gfamhp.png", description: "Another great clan! Take this place as an opportunity to thrive, master your skill in Poxel!", status: "Available for Requests (Includes Requirements)", link: "https://discord.gg/7NH6t4NXJN", coverImage: "https://res.cloudinary.com/djttn4xvk/image/upload/v1742231865/image_2025-03-17_171737081_gfamhp.png", dateAdded: new Date("2025-03-16"), isHardcoded: true
    },
    {
        id: 'hc-4', name: "LOVE", logo: "https://res.cloudinary.com/djttn4xvk/image/upload/v1742403704/image_2025-03-19_170121296_rzyhyk.png", description: "An amazing clan made by the almighty Julink. This clan is a place to spread the love!", status: "Open Clan", link: "", coverImage: "https://res.cloudinary.com/djttn4xvk/image/upload/v1742403303/image_2025-03-19_165500845_lnxxha.png", dateAdded: new Date("2025-03-19"), isHardcoded: true
    },
    {
        id: 'hc-5', name: "SOLO", logo: "https://res.cloudinary.com/djttn4xvk/image/upload/v1742231812/image_2025-03-17_171650661_lpdtm0.png", description: "One Man Clan", status: "Closed Clan", link: "", coverImage: "https://res.cloudinary.com/djttn4xvk/image/upload/v1744098107/image_2025-04-08_084145071_am5uhg.png", dateAdded: new Date("2025-04-06"), isHardcoded: true
    },
    {
        id: 'hc-7', name: "†ɢᴏᴛʜ†", logo: "https://res.cloudinary.com/djttn4xvk/image/upload/v1744098277/image_2025-04-08_084435880_zq53ti.png", description: "Goth clan is a clan for Poxel.io and will be on TOP", status: "Available for Requests (Includes Requirements)", link: "https://discord.gg/tDU4x8cqyD", coverImage: "https://res.cloudinary.com/djttn4xvk/image/upload/v1744098277/image_2025-04-08_084435880_zq53ti.png", dateAdded: new Date("2025-04-08"), isHardcoded: true
    },
    {
        id: 'hc-8', name: "RZOR", logo: "https://res.cloudinary.com/djttn4xvk/image/upload/v1744388102/image_2025-04-11_171500347_ahd44w.png", description: "To be in it, you must have a good KDR and stats, if you already are in RZOR for Kour join us again", status: "Available for Requests (Includes Requirements)", link: "https://discord.gg/u9XGMwakvu", coverImage: "https://res.cloudinary.com/djttn4xvk/image/upload/v1744388115/image_2025-04-11_171514072_fgw2rk.png", dateAdded: new Date("2025-04-11"), isHardcoded: true
    },
    {
        id: 'hc-9', name: "🇺🇦 Ukraine", logo: "https://res.cloudinary.com/djttn4xvk/image/upload/v1744474983/image_2025-04-12_172300985_f1ac40.png", description: "We are a Ukrainian Poxel.io clan uniting players from Ukraine and beyond. Our community focuses on teamwork, skill development, fun events, and meme-worthy moments!Join us to connect, compete, and win.", status: "Available for Requests (Includes Requirements)", link: "https://discord.gg/AaNUcgMY", coverImage: "https://res.cloudinary.com/djttn4xvk/image/upload/v1744474994/image_2025-04-12_172311705_nu100f.png", dateAdded: new Date("2025-04-12"), isHardcoded: true
    },
    {
        id: 'hc-10', name: "TzN", logo: "https://res.cloudinary.com/djttn4xvk/image/upload/v1744874654/image_2025-04-17_082412020_elmjnc.png", description: "TzN Is a competitive clan with many of its members originating from all types of shooters, but mainly Venge.io which most will know us for, but we are expanding to Poxel to seek new a great players to play competitive, We hope you can have a great stay when you make it in to TzN, but know it will be difficult to join, we are a close community, and looking for new members always! Thank you", status: "Available for Requests (Includes Requirements)", link: "https://discord.gg/GpU2D77Yxb", coverImage: "https://res.cloudinary.com/djttn4xvk/image/upload/v1744874654/image_2025-04-17_082412020_elmjnc.png", dateAdded: new Date("2025-04-17"), isHardcoded: true
    },
    {
        id: 'hc-11', name: "H8TR", logo: "", description: "H8TR is a new clan founded by Smillley. This clan is to only have good players. if you just started, I'm sorry, you can't join (jesus fucking christ thats toxic - bloo) Reqs in server", status: "Available for Requests (Includes Requirements)", link: "https://discord.gg/pn9rE3SDX7", coverImage: "", dateAdded: new Date("2025-05-8"), isHardcoded: true
    },
];


// --- Firestore Initialization ---

/**
 * Initializes Firestore database and collection references.
 * Should only be called AFTER Firebase App is initialized.
 */
function initializeFirestoreRefs() {
    try {
        // Check if Firebase and Firestore function exist
        if (typeof firebase !== 'undefined' && firebase.app && typeof firebase.firestore === 'function') {
            db = firebase.firestore(); // Get Firestore instance
            // *** IMPORTANT: Replace 'clans' if your Firestore collection name is different ***
            clansCollection = db.collection('clans');
            console.log("Firestore 'clans' collection reference initialized.");
        } else {
            console.error("Firebase or Firestore service is not available for initialization.");
            // clansCollection will remain undefined, fetchAndRenderClans will handle this
        }
    } catch (error) {
        console.error("Error initializing Firestore references:", error);
        // clansCollection will remain undefined
    }
}

// --- Utility Functions ---

/**
 * Checks if a clan was added recently (e.g., within the last 3 days).
 * @param {Date} dateAdded - The date the clan was added.
 * @returns {boolean} - True if the clan is considered new, false otherwise.
 */
function isNewClan(dateAdded) {
    if (!dateAdded || !(dateAdded instanceof Date)) return false;
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3); // Check for last 3 days
    return dateAdded > threeDaysAgo;
}

/**
 * Formats a date into a relative string (e.g., "Yesterday", "3 days ago").
 * @param {Date | Object} dateInput - The date object or Firestore Timestamp-like object.
 * @returns {string} - The formatted relative date string.
 */
function formatRelativeDate(dateInput) {
    let date = dateInput;
    // Convert Firestore Timestamp if necessary
    if (date && typeof date.toDate === 'function') {
        date = date.toDate();
    }

    if (!(date instanceof Date) || isNaN(date)) { // Check if it's a valid Date object
        console.warn("Invalid date provided to formatRelativeDate:", dateInput);
        return "Unknown date";
    }

    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMs < 0) { // Date is in the future
        return date.toLocaleDateString();
    } else if (diffInDays === 0) {
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        if (diffInHours < 1) return "Just now";
        if (diffInHours < now.getHours()) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        return "Today";
    } else if (diffInDays === 1) {
        return "Yesterday";
    } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
    } else {
        return date.toLocaleDateString(); // e.g., "MM/DD/YYYY"
    }
}

/**
 * Determines the CSS class for the status indicator dot based on clan status.
 * @param {string} status - The clan's status string.
 * @returns {string} - The CSS class name.
 */
function getStatusDotClass(status) {
    const statusLower = (status || "").toLowerCase();
    if (statusLower.includes("open")) return "status-dot-open";
    if (statusLower.includes("available") || statusLower.includes("requests")) return "status-dot-requests";
    return "status-dot-closed"; // Default for "Closed", "Invite Only", etc.
}

/**
 * Generates the HTML for the action button (Join/Closed/Info).
 * @param {object} clan - The clan data object.
 * @returns {string} - The HTML string for the button.
 */
function getButtonHTML(clan) {
    const statusLower = (clan.status || "").toLowerCase();
    const hasLink = clan.link && clan.link.trim() !== '';

    if (statusLower.includes("closed") || statusLower.includes("invite only")) {
        return `<div class="closed-button">Closed <i class="fas fa-lock"></i></div>`;
    } else if (hasLink) {
        // Link is present and status allows joining
        return `<a href="${clan.link}" target="_blank" rel="noopener noreferrer" class="join-button">Join Discord <i class="fab fa-discord"></i></a>`;
    } else if (statusLower.includes("available") || statusLower.includes("open")) {
        // Status is open/requests, but no direct link provided
        return `<div class="closed-button" style="background-color: var(--info); opacity: 0.9;">Info in Discord <i class="fas fa-info-circle"></i></div>`;
    } else {
        return ''; // No button if status unknown and no link
    }
}

/**
 * Creates an HTML card element for a given clan.
 * @param {object} clan - The clan data object.
 * @returns {HTMLElement} - The clan card div element.
 */
function createClanCard(clan) {
    // Standardize dateAdded - Handle Firestore Timestamp or JS Date
    let dateAdded = clan.dateAdded;
    if (dateAdded && typeof dateAdded.toDate === 'function') {
        dateAdded = dateAdded.toDate(); // Convert Firestore Timestamp
    } else if (!(dateAdded instanceof Date) || isNaN(dateAdded)) {
        // Try creating from string if it's not a Date/Timestamp (less reliable)
        try { dateAdded = dateAdded ? new Date(dateAdded) : null; } catch (e) { dateAdded = null; }
    }

    const isTrulyNew = dateAdded ? isNewClan(dateAdded) : false;
    const hasLink = clan.link && clan.link.trim() !== '';
    const isJoinable = hasLink && !(clan.status || "").toLowerCase().includes("closed");
    const cardId = clan.isHardcoded ? clan.id : `fs-${clan.id}`; // Unique ID

    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-clan-id', cardId);
    card.setAttribute('data-status', clan.status || 'Unknown');
    if (dateAdded) card.setAttribute('data-date', dateAdded.getTime()); // Store timestamp for potential sorting
    card.setAttribute('data-new', isTrulyNew); // Dynamic 'new' status

    const logoSrc = clan.logo || 'https://via.placeholder.com/40/0F172A/FFFFFF?text=L';
    const coverSrc = clan.coverImage || 'https://via.placeholder.com/300x180/1E293B/94A3B8?text=No+Banner';

    // Build inner HTML content
    const innerHTML = `
       ${isTrulyNew ? '<div class="new-tag">NEW</div>' : ''}
       <img class="card-image" src="${coverSrc}" alt="${clan.name || 'Clan Banner'}" loading="lazy">
       <div class="card-content">
           <div class="card-title">
               <img class="card-logo" src="${logoSrc}" alt="${clan.name || 'Clan'} logo" loading="lazy">
               <h3>${clan.name || 'Unnamed Clan'}</h3>
           </div>
           <p class="card-description">
               ${clan.description || 'No description provided.'}
           </p>
           <div class="card-buttons">
               ${getButtonHTML(clan)}
           </div>
           <div class="card-stats">
               <div class="status-indicator">
                   <div class="${getStatusDotClass(clan.status)}"></div>
                   ${clan.status || 'Status Unknown'}
               </div>
               <div class="date-added">${dateAdded ? `${formatRelativeDate(dateAdded)}` : 'Unknown date'}</div>
           </div>
       </div>
    `;

    // If the clan is joinable via a link, wrap the inner content with an <a> tag
    if (isJoinable) {
        card.innerHTML = `
            <a href="${clan.link}" target="_blank" rel="noopener noreferrer" class="card-link-wrapper">
                ${innerHTML}
            </a>`;
    } else {
        card.innerHTML = innerHTML; // Otherwise, just set the innerHTML directly
    }

    return card;
}


// --- Main Fetching and Rendering Logic ---

/**
 * Fetches clans from Firestore, combines with hardcoded ones, filters, sorts, and renders them.
 * @param {string} [searchTerm=''] - Optional search term to filter clans.
 */
async function fetchAndRenderClans(searchTerm = '') {
    if (!clansGrid) {
        console.error("Clans grid container not found.");
        return;
    }
    clansGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: var(--text-muted);">Loading clans...</p>';

    let firestoreClans = [];
    let fetchError = null;

    // Check if Firestore is available before trying to fetch
    if (!clansCollection) {
        console.warn("Firestore collection reference is not available. Only hardcoded clans will be shown.");
        fetchError = "Could not connect to the dynamic clans database."; // Set error message
    } else {
        // Fetch from Firestore
        try {
            // *** Ensure 'createdAt' is the correct field name for your timestamp in Firestore ***
            const snapshot = await clansCollection.orderBy("createdAt", "desc").get();
            firestoreClans = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id, // Firestore document ID
                    ...data,
                    // Convert Firestore Timestamp (use field name 'createdAt' or your actual field)
                    dateAdded: data.createdAt?.toDate ? data.createdAt.toDate() : null // Convert or null
                };
            });
            console.log(`Fetched ${firestoreClans.length} clans from Firestore.`);
        } catch (error) {
            console.error("Error fetching dynamic clans from Firestore:", error);
            fetchError = "Failed to load dynamic clans. Displaying defaults.";
            firestoreClans = []; // Ensure it's empty on error
        }
    }

    // Combine hardcoded and Firestore clans
    // Use a Set to prevent duplicates if a hardcoded clan somehow also exists in Firestore (based on name or a unique ID if you had one)
    // This simple combination assumes IDs are distinct ('hc-' prefix vs Firestore IDs)
    let allClans = [...hardcodedClans, ...firestoreClans];

    // Sort the combined list by date (newest first)
    allClans.sort((a, b) => {
        let dateA = a.dateAdded instanceof Date ? a.dateAdded : 0;
        let dateB = b.dateAdded instanceof Date ? b.dateAdded : 0;
        return (dateB || 0) - (dateA || 0); // Sort descending (newest first)
    });

    // Filter based on search term
    const searchTermLower = searchTerm.trim().toLowerCase();
    const filteredClans = searchTermLower ? allClans.filter(clan =>
        (clan.name && clan.name.toLowerCase().includes(searchTermLower)) ||
        (clan.description && clan.description.toLowerCase().includes(searchTermLower))
    ) : allClans; // If no search term, show all

    // Render
    clansGrid.innerHTML = ''; // Clear loading/previous content

    if (filteredClans.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-results'; // Add a class for styling
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.gridColumn = '1 / -1';
        emptyMessage.innerHTML = `
            <i class="fas ${searchTerm ? 'fa-search' : 'fa-box-open'}" style="font-size: 2.5em; margin-bottom: 1rem; color: var(--text-muted);"></i>
            <p>${searchTerm ? `No clans match "${searchTerm}"` : 'No clans listed yet.'}</p>
            ${fetchError ? `<p style="font-size: 0.9em; color: var(--warning); margin-top: 0.5rem;">${fetchError}</p>` : ''}
        `;
         // Show fetch error here if list is empty
        clansGrid.appendChild(emptyMessage);
    } else {
        // Optionally display the fetch error as a non-blocking message above the grid
        if(fetchError) {
            const errorNotice = document.createElement('p');
            errorNotice.textContent = fetchError;
            errorNotice.style.color = 'var(--warning)';
            errorNotice.style.textAlign = 'center';
            errorNotice.style.marginBottom = '1rem';
            errorNotice.style.gridColumn = '1 / -1';
            clansGrid.appendChild(errorNotice);
        }

        filteredClans.forEach(clan => {
            try {
                const card = createClanCard(clan);
                clansGrid.appendChild(card);
            } catch (cardError) {
                console.error("Error creating card for clan:", clan.id || clan.name, cardError);
                // Optionally render a placeholder error card
            }
        });
    }
}

// --- Initialization and Event Listeners ---

/**
 * Attempts to initialize Firestore and render clans.
 * Called either immediately if Firebase ready or by event listener.
 */
function initializeAndRender() {
    console.log("Attempting to initialize Firestore refs and render clans...");
    initializeFirestoreRefs(); // Define db and clansCollection
    fetchAndRenderClans();    // Fetch and render (includes checks for clansCollection)
}

// Check if Firebase is already available (e.g., script loaded after firebase-config)
if (typeof firebase !== 'undefined' && firebase.app && firebase.firestore) {
    console.log("Firebase already initialized. Proceeding with initialization and rendering.");
    initializeAndRender();
} else {
    // Wait for the custom 'firebaseReady' event dispatched from firebase-config.js
    console.warn("Firebase not ready yet. Waiting for 'firebaseReady' event...");
    document.addEventListener('firebaseReady', initializeAndRender, { once: true }); // Use { once: true }
}

// Search Input Listener with Debouncing
if (searchInput) {
    searchInput.addEventListener('input', () => {
        clearTimeout(searchDebounceTimer); // Clear previous timer
        searchDebounceTimer = setTimeout(() => {
            console.log(`Searching for: ${searchInput.value}`);
            fetchAndRenderClans(searchInput.value); // Pass the current search value
        }, 300); // 300ms debounce delay
    });
} else {
    console.warn("Search input element not found.");
}

// Expose fetchAndRenderClans globally if needed by other scripts (e.g., auth state changes)
window.renderClans = fetchAndRenderClans;

// --- Reminder ---
// Make sure you dispatch the 'firebaseReady' event in your firebase-config.js
// after Firebase has been initialized:
//
// Example in firebase-config.js:
//
//   firebase.initializeApp(firebaseConfig);
//   // Initialize other services like Auth if needed
//   console.log("Firebase Initialized.");
//   // Dispatch the event *after* initialization is complete
//   document.dispatchEvent(new CustomEvent('firebaseReady'));
//
