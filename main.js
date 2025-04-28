const clansGrid = document.getElementById('clansGrid');
const searchInput = document.getElementById('searchInput');

// 1. Reinstate the hardcoded clans list here
//    Add an 'isHardcoded' flag and ensure dateAdded is a JS Date object.
const hardcodedClans = [
    {
        id: 'hc-1', // Use a distinct ID format for hardcoded ones
        name: "MYTH",
        logo: "https://res.cloudinary.com/djttn4xvk/image/upload/v1744798245/image_1_gthnh9.png",
        description: "Myth is the one of the most prestigious and innovative clans out there. Myth is certainly a great pick to join! Master your talent and climb your way to the top of the leaderboard! MYTH ON TOP!",
        status: "Available for Requests (Includes Requirements)",
        link: "https://discord.gg/4CWsuHdgzN",
        coverImage: "https://res.cloudinary.com/djttn4xvk/image/upload/v1744798245/image_1_gthnh9.png",
        dateAdded: new Date("2025-03-13"), // Use JS Date object
        isHardcoded: true // Flag
    },
    {
        id: 'hc-2',
        name: "SSL",
        logo: "https://res.cloudinary.com/djttn4xvk/image/upload/v1742231812/image_2025-03-17_171650661_lpdtm0.png",
        description: "An original clan made by Ssslick back in the good ol' days! This clan is for developers and top tier goats!",
        status: "Closed Clan",
        link: "",
        coverImage: "https://res.cloudinary.com/djttn4xvk/image/upload/v1742231805/image_2025-03-17_171643136_ker0vn.png",
        dateAdded: new Date("2025-03-15"),
        isHardcoded: true
    },
    {
        id: 'hc-3',
        name: "ONI",
        logo: "https://res.cloudinary.com/djttn4xvk/image/upload/v1742231865/image_2025-03-17_171737081_gfamhp.png",
        description: "Another great clan! Take this place as an opportunity to thrive, master your skill in Poxel!",
        status: "Available for Requests (Includes Requirements)",
        link: "https://discord.gg/7NH6t4NXJN",
        coverImage: "https://res.cloudinary.com/djttn4xvk/image/upload/v1742231865/image_2025-03-17_171737081_gfamhp.png",
        dateAdded: new Date("2025-03-16"),
        isNew: true, // You can still use flags like isNew if needed
        isHardcoded: true
    },
    {
        id: 'hc-4',
        name: "LOVE",
        logo: "https://res.cloudinary.com/djttn4xvk/image/upload/v1742403704/image_2025-03-19_170121296_rzyhyk.png",
        description: "An amazing clan made by the almighty Julink. This clan is a place to spread the love!",
        status: "Open Clan",
        link: "",
        coverImage: "https://res.cloudinary.com/djttn4xvk/image/upload/v1742403303/image_2025-03-19_165500845_lnxxha.png",
        dateAdded: new Date("2025-03-19"),
        isNew: true,
        isHardcoded: true
    },
    {
        id: 'hc-5',
        name: "SOLO",
        logo: "https://res.cloudinary.com/djttn4xvk/image/upload/v1742231812/image_2025-03-17_171650661_lpdtm0.png",
        description: "One Man Clan",
        status: "Closed Clan",
        link: "",
        coverImage: "https://res.cloudinary.com/djttn4xvk/image/upload/v1744098107/image_2025-04-08_084145071_am5uhg.png",
        dateAdded: new Date("2025-04-06"),
        isNew: true,
        isHardcoded: true
    },
   {
        id: 'hc-6',
        name: "UNIQUE",
        logo: "https://res.cloudinary.com/djttn4xvk/image/upload/v1744011103/anotherimage_rkqmor.png",
        description: "Always on Top. Always Unique",
        status: "Available for Requests (Includes Requirements)",
        link: "https://discord.gg/G5yd8KU5qm",
        coverImage: "https://res.cloudinary.com/djttn4xvk/image/upload/v1744011111/image_mvxyrf.png",
        dateAdded: new Date("2025-04-08"),
        isNew: true,
        isHardcoded: true
    },
   {
        id: 'hc-7',
        name: "†ɢᴏᴛʜ†",
        logo: "https://res.cloudinary.com/djttn4xvk/image/upload/v1744098277/image_2025-04-08_084435880_zq53ti.png",
        description: "Goth clan is a clan for Poxel.io and will be on TOP",
        status: "Available for Requests (Includes Requirements)",
        link: "https://discord.gg/tDU4x8cqyD",
        coverImage: "https://res.cloudinary.com/djttn4xvk/image/upload/v1744098277/image_2025-04-08_084435880_zq53ti.png",
        dateAdded: new Date("2025-04-08"),
        isNew: true,
        isHardcoded: true
    },
   {
        id: 'hc-8',
        name: "RZOR",
        logo: "https://res.cloudinary.com/djttn4xvk/image/upload/v1744388102/image_2025-04-11_171500347_ahd44w.png",
        description: "To be in it, you must have a good KDR and stats, if you already are in RZOR for Kour join us again",
        status: "Available for Requests (Includes Requirements)",
        link: "https://discord.gg/u9XGMwakvu",
        coverImage: "https://res.cloudinary.com/djttn4xvk/image/upload/v1744388115/image_2025-04-11_171514072_fgw2rk.png",
        dateAdded: new Date("2025-04-11"), // Corrected month if needed
        isNew: true,
        isHardcoded: true
    },
   {
        id: 'hc-9',
        name: "🇺🇦 Ukraine",
        logo: "https://res.cloudinary.com/djttn4xvk/image/upload/v1744474983/image_2025-04-12_172300985_f1ac40.png",
        description: "We are a Ukrainian Poxel.io clan uniting players from Ukraine and beyond. Our community focuses on teamwork, skill development, fun events, and meme-worthy moments!Join us to connect, compete, and win.",
        status: "Available for Requests (Includes Requirements)",
        link: "https://discord.gg/AaNUcgMY",
        coverImage: "https://res.cloudinary.com/djttn4xvk/image/upload/v1744474994/image_2025-04-12_172311705_nu100f.png",
        dateAdded: new Date("2025-04-12"),
        isNew: true,
        isHardcoded: true
    },
   {
        id: 'hc-10',
        name: "TzN",
        logo: "https://res.cloudinary.com/djttn4xvk/image/upload/v1744874654/image_2025-04-17_082412020_elmjnc.png",
        description: "TzN Is a competitive clan with many of its members originating from all types of shooters, but mainly Venge.io which most will know us for, but we are expanding to Poxel to seek new a great players to play competitive, We hope you can have a great stay when you make it in to TzN, but know it will be difficult to join, we are a close community, and looking for new members always! Thank you",
        status: "Available for Requests (Includes Requirements)",
        link: "https://discord.gg/GpU2D77Yxb",
        coverImage: "https://res.cloudinary.com/djttn4xvk/image/upload/v1744874654/image_2025-04-17_082412020_elmjnc.png",
        dateAdded: new Date("2025-04-17"),
        isNew: true,
        isHardcoded: true
    },
];


// --- Utility Functions (Mostly Unchanged) ---

function isNewClan(dateAdded) {
    if (!dateAdded || !(dateAdded instanceof Date)) return false;
    const checkDate = new Date(dateAdded); // Ensure it's a Date object
    const threeDaysAgo = new Date();       // Check for last 3 days instead of 7? Adjust as needed.
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    // console.log("Checking date:", checkDate, "against", threeDaysAgo, checkDate > threeDaysAgo);
    return checkDate > threeDaysAgo;
}


function formatRelativeDate(date) {
    if (!date || !(date instanceof Date)) { // Check if it's a valid Date object
         // Try converting if it's a Firestore Timestamp-like object
         if (date && typeof date.toDate === 'function') {
             date = date.toDate();
         } else {
             console.warn("Invalid date provided to formatRelativeDate:", date);
             return "Unknown";
         }
     }
     const now = new Date();
     // Calculate difference in milliseconds and convert to days
     const diffInMs = now - date;
     const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

     if (diffInMs < 0) { // Date is in the future?
         return date.toLocaleDateString(); // Show future date plainly
     } else if (diffInDays === 0) {
         // Check if it's within the last few hours to maybe say "few hours ago"
         const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
         if (diffInHours < 1) return "Just now";
         if (diffInHours < now.getHours()) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
         return "Today"; // If same day but longer ago
     } else if (diffInDays === 1) {
         return "Yesterday";
     } else if (diffInDays < 7) {
         return `${diffInDays} days ago`;
     } else {
         return date.toLocaleDateString(); // Format as MM/DD/YYYY or locale default
     }
}


function getStatusDotClass(status) {
    status = status || ""; // Default to empty string if undefined
    const statusLower = status.toLowerCase();
    if (statusLower.includes("open")) {
        return "status-dot-open";
    } else if (statusLower.includes("available") || statusLower.includes("requests")) {
        return "status-dot-requests";
    } else { // Includes "Closed Clan", "Invite Only" and any other status
        return "status-dot-closed";
    }
}

function getButtonHTML(clan) {
    const statusLower = (clan.status || "").toLowerCase();
    const hasLink = clan.link && clan.link.trim() !== '';

    if (statusLower.includes("closed") || statusLower.includes("invite only")) {
        return `<div class="closed-button">Closed <i class="fas fa-lock"></i></div>`;
    } else if (hasLink) {
         // Use target="_blank" for external links
         return `<a href="${clan.link}" target="_blank" rel="noopener noreferrer" class="join-button">Join Discord <i class="fab fa-discord"></i></a>`; // More specific button text/icon
    } else if (statusLower.includes("available") || statusLower.includes("open")) {
        // Optionally add a button like "More Info" or nothing if no link
         return `<div class="closed-button" style="background-color: var(--warning); opacity: 0.8;">Info in Discord <i class="fas fa-info-circle"></i></div>`; // Placeholder if no direct join link
    } else {
        return ''; // No button if status is unknown and no link
    }
}

function createClanCard(clan) {
    // Ensure dateAdded is a JS Date object, whether from hardcoded or Firestore
    let dateAdded = clan.dateAdded;
    if (dateAdded && typeof dateAdded.toDate === 'function') { // Check if it's a Firestore Timestamp
        dateAdded = dateAdded.toDate();
    } else if (!(dateAdded instanceof Date)) {
         // If it's not a Date or Timestamp, try creating one (e.g., from string, might fail)
         try {
            dateAdded = dateAdded ? new Date(dateAdded) : null;
         } catch (e) {
            dateAdded = null; // Invalid date format
         }
    }


    // Recalculate isNew based on the standardized dateAdded, but only if not already set (priority to hardcoded value)
    // However, using a dynamic date check is better
    const isTrulyNew = dateAdded ? isNewClan(dateAdded) : false;
    const hasLink = clan.link && clan.link.trim() !== '';
    const cardId = clan.isHardcoded ? clan.id : `fs-${clan.id}`; // Unique ID for the DOM element if needed

    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-clan-id', cardId);
    card.setAttribute('data-status', clan.status || 'Unknown');
    if (dateAdded) card.setAttribute('data-date', dateAdded.getTime());
    card.setAttribute('data-new', isTrulyNew); // Use the dynamically checked value

    const logoSrc = clan.logo || 'https://via.placeholder.com/40/0F172A/FFFFFF?text=L';
    const coverSrc = clan.coverImage || 'https://via.placeholder.com/300x180/1E293B/94A3B8?text=No+Banner';

    // Determine if the whole card should be a link vs. just the button
    const isClickable = !clan.status?.toLowerCase().includes("closed") && hasLink;
    const Tag = isClickable ? 'a' : 'div'; // Card container is 'a' or 'div'
    const linkAttrs = isClickable ? `href="${clan.link}" target="_blank" rel="noopener noreferrer"` : '';

    card.innerHTML = `
        <${Tag} class="card-link-wrapper" ${linkAttrs}>
            ${isTrulyNew ? '<div class="new-tag">NEW</div>' : ''}
            <img class="card-image" src="${coverSrc}" alt="${clan.name || 'Clan Banner'}" loading="lazy"> <!-- Added lazy loading -->
            <div class="card-content">
                <div class="card-title">
                    <img src="${logoSrc}" alt="${clan.name || 'Clan'} logo" loading="lazy">
                    <h3>${clan.name || 'Unnamed Clan'}</h3>
                </div>
                <p class="card-description">
                    ${clan.description || 'No description provided.'}
                </p>
                <!-- Button container is now outside the <a> if the card itself is the link -->
                ${!isClickable ? `<div class="card-buttons">${getButtonHTML(clan)}</div>` : ''}
                <div class="card-stats">
                    <div class="online-count">
                        <div class="${getStatusDotClass(clan.status)}"></div>
                        ${clan.status || 'Status Unknown'}
                    </div>
                    <div class="date-added">${dateAdded ? `${formatRelativeDate(dateAdded)}` : ''}</div>
                </div>
            </div>
        </${Tag}>
        <!-- If the card itself isn't clickable, the button lives inside the main div but outside the card-link-wrapper -->
         ${isClickable ? `<div class="card-content" style="padding-top: 0; padding-bottom: 1.5rem;"><div class="card-buttons">${getButtonHTML(clan)}</div></div>` : ''}

    `;

    // Correction: If the card IS the link, the button needs to be placed differently or styled absolutely?
    // Simpler approach: If card is the link, DON'T render a separate button, maybe style the card itself?
    // Let's revert: Place button always before stats, inside card-content. The <a> wrapper handles the click for the whole card if needed.

    card.innerHTML = `
       ${isTrulyNew ? '<div class="new-tag">NEW</div>' : ''}
       <img class="card-image" src="${coverSrc}" alt="${clan.name || 'Clan Banner'}" loading="lazy">
       <div class="card-content">
           <div class="card-title">
               <img src="${logoSrc}" alt="${clan.name || 'Clan'} logo" loading="lazy">
               <h3>${clan.name || 'Unnamed Clan'}</h3>
           </div>
           <p class="card-description">
               ${clan.description || 'No description provided.'}
           </p>
           <div class="card-buttons"> <!-- Container for button(s) -->
               ${getButtonHTML(clan)}
           </div>
           <div class="card-stats">
               <div class="online-count">
                   <div class="${getStatusDotClass(clan.status)}"></div>
                   ${clan.status || 'Status Unknown'}
               </div>
               <div class="date-added">${dateAdded ? `${formatRelativeDate(dateAdded)}` : ''}</div>
           </div>
       </div>
    `;

     // Now wrap the whole card content with <a> if it's supposed to be clickable
     if (hasLink) {
        const anchor = document.createElement('a');
        // Don't link 'Closed' clans even if they have a link maybe? User preference.
        if (!clan.status?.toLowerCase().includes("closed")){
             anchor.href = clan.link;
             anchor.target = "_blank";
             anchor.rel = "noopener noreferrer";
             anchor.style.textDecoration = 'none';
             anchor.style.color = 'inherit';
             anchor.style.display = 'block'; // Make anchor fill the card space
             anchor.innerHTML = card.innerHTML; // Move the content inside the link
             card.innerHTML = ''; // Clear the card
             card.appendChild(anchor); // Add the link as the card's content
        }
     } // else the card div remains as is, buttons inside work independently


    return card;
}


async function fetchAndRenderClans(searchTerm = '') {
    if (!clansGrid) return;
    clansGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: var(--text-muted);">Loading clans...</p>';

    let firestoreClans = [];
    try {
        // 2. Fetch from Firestore
        const snapshot = await clansCollection
                                .orderBy("createdAt", "desc") // Firestore timestamp field
                                .get();
        firestoreClans = snapshot.docs.map(doc => ({
            id: doc.id, // Firestore document ID
            ...doc.data(),
            // Convert Firestore Timestamp specifically (use field name 'createdAt' from Firestore)
            dateAdded: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date() // Fallback
        }));

    } catch (error) {
        console.error("Error fetching dynamic clans:", error);
        // Decide if you want to proceed with only hardcoded clans or show an error
        // clansGrid.innerHTML = '<p style="color: var(--danger); text-align: center; grid-column: 1 / -1;">Could not load dynamic clans.</p>';
        // return; // Or continue to show hardcoded ones
    }

    // 3. Combine hardcoded and Firestore clans
    let allClans = [...hardcodedClans, ...firestoreClans];

     // Optional: Sort the combined list by date (newest first)
     // Make sure dateAdded is a valid Date object for comparison
    allClans.sort((a, b) => {
         let dateA = a.dateAdded instanceof Date ? a.dateAdded : (a.dateAdded?.toDate ? a.dateAdded.toDate() : 0);
         let dateB = b.dateAdded instanceof Date ? b.dateAdded : (b.dateAdded?.toDate ? b.dateAdded.toDate() : 0);
        return (dateB || 0) - (dateA || 0); // Sort descending (newest first)
     });

    // 4. Filter based on search term
    const searchTermLower = searchTerm.toLowerCase();
    const filteredClans = allClans.filter(clan =>
         (clan.name && clan.name.toLowerCase().includes(searchTermLower)) ||
         (clan.description && clan.description.toLowerCase().includes(searchTermLower))
    );

    // 5. Render
    clansGrid.innerHTML = ''; // Clear loading message

    if (filteredClans.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-results';
        emptyMessage.innerHTML = `
            <i class="fas ${searchTerm ? 'fa-search' : 'fa-box-open'}"></i>
            <p>${searchTerm ? 'No clans match your search' : 'No clans found.'}</p>
        `;
        clansGrid.appendChild(emptyMessage);
        return;
    }

    filteredClans.forEach(clan => {
         try {
            const card = createClanCard(clan);
            clansGrid.appendChild(card);
         } catch (cardError) {
            console.error("Error creating card for clan:", clan.id || clan.name, cardError);
         }
    });
}

// Initial Render Call - Ensure this is called after Firebase is initialized
// It might be called from auth.js's onAuthStateChanged listener to ensure
// Firebase is ready, or called directly here if auth.js is guaranteed to load first.
// Let's assume it's safe to call here for simplicity, but verify load order.
if (typeof firebase !== 'undefined' && firebase.app()) { // Basic check if Firebase is loaded
    fetchAndRenderClans();
} else {
     // Fallback if Firebase loads slower - consider moving the call
     console.warn("Firebase not ready, delaying initial clan render.");
     document.addEventListener('firebaseReady', () => fetchAndRenderClans()); // Custom event pattern example
}


// Search Input Listener
if (searchInput) {
    searchInput.addEventListener('input', () => {
        // Debounce search input slightly to avoid rapid re-renders
        clearTimeout(searchInput.timer);
        searchInput.timer = setTimeout(() => {
             fetchAndRenderClans(searchInput.value);
        }, 300); // Adjust debounce delay as needed (e.g., 300ms)
    });
}

// Expose renderClans globally if needed by auth.js (still recommended)
window.renderClans = fetchAndRenderClans;

// Example of dispatching a custom event when Firebase is ready (place in firebase-config.js)
/*
 // In firebase-config.js, after firebase.initializeApp(firebaseConfig);
 document.dispatchEvent(new CustomEvent('firebaseReady'));
*/
