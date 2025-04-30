// Elements
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

// Cloudinary config
const CLOUDINARY_CLOUD_NAME = "djttn4xvk";
const CLOUDINARY_UPLOAD_PRESET = "compmanage";

// Blacklisted words
const BLACKLISTED_WORDS = ['furry', 'hitler', 'slave', 'nigger', 'nigga', 'kkk', 'KKK', 'Nazi', 'N1GG3R', 'NGA', 'FAGGOT', 'faggot', 'kys', 'nga', 'cunt', 'paki', 'PALESTINE', 'palestine'];

let currentUser = null;

function containsBlacklistedWords(text) {
    const lower = text.toLowerCase();
    return BLACKLISTED_WORDS.some(word => lower.includes(word));
}

function setFormMessage(message, isError = false) {
    if (!formMessage) return;
    formMessage.textContent = message;
    formMessage.className = isError ? 'error' : 'success';
    setTimeout(() => {
        if (formMessage.textContent === message) {
            formMessage.textContent = '';
            formMessage.className = '';
        }
    }, 5000);
}

function resetForm() {
    clanForm.reset();
    clanIdInput.value = '';
    clanLogoUrlInput.value = '';
    clanCoverImageUrlInput.value = '';
    logoPreview.src = '';
    bannerPreview.src = '';
    logoPreview.style.border = '1px dashed var(--gray)';
    bannerPreview.style.border = '1px dashed var(--gray)';
    formTitle.textContent = 'Add Your Clan';
    submitClanBtn.textContent = 'Add Clan';
    submitClanBtn.disabled = false;
    cancelEditBtn.style.display = 'none';
    formMessage.textContent = '';
    formMessage.className = '';
}

function loadUserProfile() {
    currentUser = auth.currentUser;
    if (currentUser) {
        profileContent.style.display = 'block';
        loginPrompt.style.display = 'none';
        welcomeMessage.textContent = `Welcome, ${currentUser.email}! Manage your clans below.`;
        resetForm();
        fetchUserClans();
    } else {
        profileContent.style.display = 'none';
        loginPrompt.style.display = 'block';
        userClansList.innerHTML = '';
    }
}

const createUploadWidget = (options, callback) => {
    return cloudinary.createUploadWidget({
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        folder: 'poxel_clans',
        ...options
    }, (err, result) => {
        if (!err && result && result.event === 'success') {
            callback(result.info.secure_url);
        } else if (err) {
            console.error('Cloudinary Upload Error:', err);
            setFormMessage("Image upload failed. Please try again.", true);
        }
    });
};

const logoUploadWidget = createUploadWidget({}, url => {
    clanLogoUrlInput.value = url;
    logoPreview.src = url;
    logoPreview.style.border = 'none';
});

const bannerUploadWidget = createUploadWidget({ cropping: true, croppingAspectRatio: 16 / 9 }, url => {
    clanCoverImageUrlInput.value = url;
    bannerPreview.src = url;
    bannerPreview.style.border = 'none';
});

uploadLogoBtn?.addEventListener('click', () => logoUploadWidget.open());
uploadBannerBtn?.addEventListener('click', () => bannerUploadWidget.open());
cancelEditBtn?.addEventListener('click', resetForm);

clanForm?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!currentUser) return setFormMessage("You must be logged in to add/edit clans.", true);

    const name = clanNameInput.value.trim();
    const desc = clanDescriptionInput.value.trim();

    if (!name || !desc) return setFormMessage("Clan Name and Description are required.", true);
    if (containsBlacklistedWords(name) || containsBlacklistedWords(desc)) {
        return setFormMessage("Clan name or description contains blacklisted words.", true);
    }

    const clanData = {
        name,
        description: desc,
        link: clanDiscordInput.value.trim() || null,
        status: clanStatusInput.value,
        logo: clanLogoUrlInput.value || null,
        coverImage: clanCoverImageUrlInput.value || null,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const editingId = clanIdInput.value;
    submitClanBtn.disabled = true;
    setFormMessage("Submitting...");

    try {
        if (editingId) {
            delete clanData.createdAt;
            await clansCollection.doc(editingId).set(clanData, { merge: true });
            setFormMessage("Clan updated successfully!");
        } else {
            await clansCollection.add(clanData);
            setFormMessage("Clan added successfully!");
        }
        resetForm();
        fetchUserClans();
    } catch (err) {
        console.error("Error saving clan:", err);
        setFormMessage(`Error: ${err.message}`, true);
        submitClanBtn.disabled = false;
    }
});

async function fetchUserClans() {
    if (!userClansList || !currentUser) return;

    loadingClansMsg.style.display = 'block';
    userClansList.innerHTML = '';

    try {
        const snapshot = await clansCollection
            .where("userId", "==", currentUser.uid)
            .orderBy("createdAt", "desc")
            .get();

        loadingClansMsg.style.display = 'none';

        if (snapshot.empty) {
            userClansList.innerHTML = '<p style="color: var(--text-muted);">You haven\'t added any clans yet.</p>';
            return;
        }

        snapshot.forEach(doc => {
            const clan = { id: doc.id, ...doc.data() };
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="clan-info">
                    <img src="${clan.logo || 'https://via.placeholder.com/40/0F172A/FFFFFF?text=L'}" alt="${clan.name} Logo">
                    <span>${clan.name}</span>
                </div>
                <div class="clan-actions">
                    <button class="edit-btn" data-id="${clan.id}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="delete-btn" data-id="${clan.id}"><i class="fas fa-trash"></i> Delete</button>
                </div>
            `;

            li.querySelector('.edit-btn').addEventListener('click', () => populateFormForEdit(clan));
            li.querySelector('.delete-btn').addEventListener('click', () => deleteClan(clan.id, clan.name));

            userClansList.appendChild(li);
        });
    } catch (err) {
        console.error("Error fetching clans:", err);
        loadingClansMsg.style.display = 'none';
        userClansList.innerHTML = '<p style="color: var(--danger);">Could not load your clans.</p>';
    }
}

function populateFormForEdit(clan) {
    resetForm();
    clanIdInput.value = clan.id;
    clanNameInput.value = clan.name || '';
    clanDescriptionInput.value = clan.description || '';
    clanDiscordInput.value = clan.link || '';
    clanStatusInput.value = clan.status || 'Available for Requests (Includes Requirements)';
    clanLogoUrlInput.value = clan.logo || '';
    clanCoverImageUrlInput.value = clan.coverImage || '';

    if (clan.logo) logoPreview.src = clan.logo;
    if (clan.coverImage) bannerPreview.src = clan.coverImage;

    logoPreview.style.border = 'none';
    bannerPreview.style.border = 'none';
    formTitle.textContent = `Edit Clan: ${clan.name}`;
    submitClanBtn.textContent = 'Update Clan';
    cancelEditBtn.style.display = 'inline-block';
    clanForm.scrollIntoView({ behavior: 'smooth' });
}

async function deleteClan(id, name) {
    if (!confirm(`Are you sure you want to delete the clan "${name}"? This cannot be undone.`)) return;

    try {
        await clansCollection.doc(id).delete();
        setFormMessage(`Clan "${name}" deleted.`);
        if (clanIdInput.value === id) resetForm();
        fetchUserClans();
    } catch (err) {
        console.error("Error deleting clan:", err);
        setFormMessage(`Error deleting clan: ${err.message}`, true);
    }
}

document.addEventListener('DOMContentLoaded', loadUserProfile);
window.loadUserProfile = loadUserProfile;
