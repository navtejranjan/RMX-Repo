// =========================================
// 1. PASSWORD TOGGLE LOGIC
// =========================================
const togglePassword = document.querySelector('#togglePassword');
const passwordInput = document.querySelector('#password');

if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function (e) {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye-slash');
    });
}

// =========================================
// 2. LIVE LOGIN LOGIC (Google Sheets)
// =========================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const loginBtn = document.querySelector('.login-btn');
        const originalBtnText = loginBtn.textContent;
        loginBtn.textContent = "LOGGING IN...";
        loginBtn.disabled = true;

        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.style.display = "none";
        }

        // --- THE FIX: SMART INPUT SCANNER ---
        const userBox = document.getElementById('username') || document.querySelector('input[type="text"]') || document.querySelector('input[type="email"]');
        const passBox = document.getElementById('password') || document.querySelector('input[type="password"]');

        if (!userBox || !passBox) {
            alert("System Error: Cannot locate the input boxes on the screen!");
            loginBtn.textContent = originalBtnText;
            loginBtn.disabled = false;
            return; // Stops the script from crashing
        }

        const usernameVal = userBox.value;
        const passwordVal = passBox.value;
        // ------------------------------------

        // =========================================================
        // ⚠️ CRITICAL: PASTE YOUR GOOGLE WEB APP URL BELOW ⚠️
        // =========================================================
        const webAppUrl = "https://script.google.com/macros/s/AKfycbxzilM5l3VvqE5ajJYYNAJIa5489E4pkLGnbXyzrj4LS80so-yWm0FZxAvG33IXGTNl/exec"; 

        const payload = {
            action: "login",
            username: usernameVal,
            password: passwordVal
        };

        fetch(webAppUrl, {
            method: "POST",
            redirect: "follow",
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                if (errorMessage) errorMessage.style.display = "none";
                
                // Store all profile data
                localStorage.setItem("loggedInName", data.name);
                localStorage.setItem("userEmail", data.email);
                localStorage.setItem("userMobile", data.mobile);
                localStorage.setItem("userEmpId", data.empId);
                localStorage.setItem("userDesignation", data.designation);
                localStorage.setItem("username", data.username);
                localStorage.setItem("userId", data.username); 
                
                if (data.profilePic) {
                    localStorage.setItem("profilePic", data.profilePic);
                } else {
                    localStorage.removeItem("profilePic");
                }
                window.location.href = "home.html"; 
            } else {
                if (errorMessage) {
                    errorMessage.textContent = data.message;
                    errorMessage.style.display = "block";
                } else {
                    alert(data.message);
                }
                loginBtn.textContent = originalBtnText;
                loginBtn.disabled = false;
            }
        })
        .catch(error => {
            console.error("Error:", error);
            loginBtn.textContent = originalBtnText;
            loginBtn.disabled = false;
            if (errorMessage) {
                errorMessage.textContent = "Network error. Please check URL or connection.";
                errorMessage.style.display = "block";
            } else {
                alert("Network error. Please check URL or connection.");
            }
        });
    });
}// =========================================
// 3. HOME SCREEN LOGIC
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const greetingText = document.getElementById('greetingText');
    const dateText = document.getElementById('dateText');
    
    if (greetingText && dateText) {
        const now = new Date();
        const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        dateText.textContent = now.toLocaleDateString('en-GB', dateOptions);
        
        const hour = now.getHours();
        let timeGreeting = "Good Evening";
        if (hour < 12) timeGreeting = "Good Morning";
        else if (hour < 17) timeGreeting = "Good Afternoon";
        
        let userFirstName = localStorage.getItem("loggedInName");
        if (!userFirstName) userFirstName = "Guest";
        else userFirstName = userFirstName.split(' ')[0]; 
        
        greetingText.textContent = `${timeGreeting}, ${userFirstName}`;
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.clear();
                window.location.href = 'index.html'; 
            });
        }

        const userRole = localStorage.getItem("userRole");
        const operatorDashboard = document.getElementById('operatorDashboard');
        if (userRole === "User" || userRole === "Operator") {
            if (operatorDashboard) operatorDashboard.style.display = "block";
        }
    }
    
    // =========================================
    // 4. ACTION MENU OVERLAY LOGIC
    // =========================================
    const gridMenuBtn = document.getElementById('gridMenuBtn');
    const actionOverlay = document.getElementById('actionOverlay');
    const rejectionEntryBtn = document.getElementById('rejectionEntryBtn');
    const handoverBtn = document.getElementById('handoverBtn');

    if (gridMenuBtn && actionOverlay) {
        gridMenuBtn.addEventListener('click', () => actionOverlay.style.display = 'flex');
        actionOverlay.addEventListener('click', (e) => {
            if (e.target === actionOverlay) actionOverlay.style.display = 'none';
        });
        if (rejectionEntryBtn) {
            rejectionEntryBtn.addEventListener('click', () => {
                actionOverlay.style.display = 'none';
                window.location.href = 'rejection.html'; 
            });
        }
        
    }
});

// =========================================
// REJECTION PREVIEW & SUBMIT LOGIC
// =========================================
const rejForm = document.getElementById('rejectionDataForm');
const rejPreviewBtn = document.getElementById('rejPreviewBtn');
const rejectionPreview = document.getElementById('rejectionPreview');
const rejPreviewContent = document.getElementById('rejPreviewContent');
const rejEditBtn = document.getElementById('rejEditBtn');
const rejFinalSubmitBtn = document.getElementById('rejFinalSubmitBtn');

if (rejPreviewBtn) {
    rejPreviewBtn.addEventListener('click', () => {
        // Force HTML5 validation (checks if Date and Shift are filled)
        if (!rejForm.reportValidity()) {
            return; 
        }

        // 1. Gather all data (Defaults to "0" or "N/A" if left blank)
        const date = document.getElementById('rejDate').value;
        const shift = document.getElementById('rejShift').value;

        const strCell = document.getElementById('str_cell').value || "0";
        const strRibbon = document.getElementById('str_ribbon').value || "0";
        const strRsn = document.getElementById('str_reason').value || "N/A";

        const bus4mm = document.getElementById('bus_4mm').value || "0";
        const bus6mm = document.getElementById('bus_6mm').value || "0";
        const busRsn = document.getElementById('bus_reason').value || "N/A";

        const srwCell = document.getElementById('srw_cell').value || "0";
        const srwRibbon = document.getElementById('srw_ribbon').value || "0";
        const srwRsn = document.getElementById('srw_reason').value || "N/A";

        const mrwCell = document.getElementById('mrw_cell').value || "0";
        const mrwRibbon = document.getElementById('mrw_ribbon').value || "0";
        const mrwBusbar = document.getElementById('mrw_busbar').value || "0";
        const mrwRsn = document.getElementById('mrw_reason').value || "N/A";

        const frmRtv = document.getElementById('frm_rtv').value || "0";
        const frmL = document.getElementById('frm_l').value || "0";
        const frmS = document.getElementById('frm_s').value || "0";
        const frmRsn = document.getElementById('frm_reason').value || "N/A";

        const potting = document.getElementById('potting').value || "0";
        const potRsn = document.getElementById('potting_reason').value || "N/A";

        const jbPos = document.getElementById('bus2_pos').value || "0";
        const jbNeg = document.getElementById('bus2_neg').value || "0";
        const jbMid = document.getElementById('bus2_mid').value || "0";
        const jbRsn = document.getElementById('bus2_reason').value || "N/A";

        const fgWt = document.getElementById('fg_weight').value || "0";
        const fgNos = document.getElementById('fg_nos').value || "0";
        const fgRsn = document.getElementById('fg_reason').value || "N/A";

        const bgWt = document.getElementById('bg_weight').value || "0";
        const bgNos = document.getElementById('bg_nos').value || "0";
        const bgRsn = document.getElementById('bg_reason').value || "N/A";

        const epeWt = document.getElementById('epe_weight').value || "0";
        const epeRsn = document.getElementById('epe_reason').value || "N/A";

        // 2. Build the HTML Summary
        rejPreviewContent.innerHTML = `
            <div style="margin-bottom:8px; font-size:16px;"><strong>Date:</strong> ${date} &nbsp;|&nbsp; <strong>Shift:</strong> ${shift}</div><hr style="border-top:1px solid #ddd; margin: 8px 0;">
            <div style="margin-bottom:8px;"><strong>STRINGER:</strong> Cell: ${strCell} Kg, Ribbon: ${strRibbon} Kg<br><em style="color:#666;">Reason: ${strRsn}</em></div><hr style="border-top:1px solid #ddd; margin: 8px 0;">
            <div style="margin-bottom:8px;"><strong>BUSSING:</strong> 4MM: ${bus4mm} Kg, 6MM: ${bus6mm} Kg<br><em style="color:#666;">Reason: ${busRsn}</em></div><hr style="border-top:1px solid #ddd; margin: 8px 0;">
            <div style="margin-bottom:8px;"><strong>STRING R/W:</strong> Cell: ${srwCell} Kg, Ribbon: ${srwRibbon} Kg<br><em style="color:#666;">Reason: ${srwRsn}</em></div><hr style="border-top:1px solid #ddd; margin: 8px 0;">
            <div style="margin-bottom:8px;"><strong>MODULE R/W:</strong> Cell: ${mrwCell} Kg, Ribbon: ${mrwRibbon} Kg, Busbar: ${mrwBusbar} Kg<br><em style="color:#666;">Reason: ${mrwRsn}</em></div><hr style="border-top:1px solid #ddd; margin: 8px 0;">
            <div style="margin-bottom:8px;"><strong>FRAMING:</strong> RTV: ${frmRtv} Kg, L: ${frmL}, S: ${frmS}<br><em style="color:#666;">Reason: ${frmRsn}</em></div><hr style="border-top:1px solid #ddd; margin: 8px 0;">
            <div style="margin-bottom:8px;"><strong>POTTING:</strong> ${potting} Kg<br><em style="color:#666;">Reason: ${potRsn}</em></div><hr style="border-top:1px solid #ddd; margin: 8px 0;">
            <div style="margin-bottom:8px;"><strong>JB:</strong> +VE: ${jbPos}, -VE: ${jbNeg}, MID: ${jbMid}<br><em style="color:#666;">Reason: ${jbRsn}</em></div><hr style="border-top:1px solid #ddd; margin: 8px 0;">
            <div style="margin-bottom:8px;"><strong>FRONT GLASS:</strong> ${fgWt} Kg, ${fgNos} Nos<br><em style="color:#666;">Reason: ${fgRsn}</em></div><hr style="border-top:1px solid #ddd; margin: 8px 0;">
            <div style="margin-bottom:8px;"><strong>BACK GLASS:</strong> ${bgWt} Kg, ${bgNos} Nos<br><em style="color:#666;">Reason: ${bgRsn}</em></div><hr style="border-top:1px solid #ddd; margin: 8px 0;">
            <div style="margin-bottom:8px;"><strong>EPE:</strong> ${epeWt} Kg<br><em style="color:#666;">Reason: ${epeRsn}</em></div>
        `;

        // 3. Hide Form, Show Preview
        window.scrollTo(0, 0);
        rejForm.style.display = "none";
        rejectionPreview.style.display = "block";
    });
}

// Edit Button Logic
if (rejEditBtn) {
    rejEditBtn.addEventListener('click', () => {
        rejectionPreview.style.display = "none";
        rejForm.style.display = "block";
    });
}

// Final Submit Button Logic
if (rejFinalSubmitBtn) {
    rejFinalSubmitBtn.addEventListener('click', () => {
        const originalText = rejFinalSubmitBtn.textContent;
        rejFinalSubmitBtn.textContent = "SUBMITTING...";
        rejFinalSubmitBtn.disabled = true;

        // =========================================================
        // ⚠️ CRITICAL: PASTE YOUR GOOGLE WEB APP URL BELOW ⚠️
        // =========================================================
        const webAppUrl = "https://script.google.com/macros/s/AKfycbxzilM5l3VvqE5ajJYYNAJIa5489E4pkLGnbXyzrj4LS80so-yWm0FZxAvG33IXGTNl/exec";

        const payload = {
            submittedBy: localStorage.getItem("username") || "Unknown",
            rejDate: document.getElementById('rejDate').value,
            rejShift: document.getElementById('rejShift').value,
            str_cell: document.getElementById('str_cell').value,
            str_ribbon: document.getElementById('str_ribbon').value,
            str_reason: document.getElementById('str_reason').value,
            bus_4mm: document.getElementById('bus_4mm').value,
            bus_6mm: document.getElementById('bus_6mm').value,
            bus_reason: document.getElementById('bus_reason').value,
            srw_cell: document.getElementById('srw_cell').value,
            srw_ribbon: document.getElementById('srw_ribbon').value,
            srw_reason: document.getElementById('srw_reason').value,
            mrw_cell: document.getElementById('mrw_cell').value,
            mrw_ribbon: document.getElementById('mrw_ribbon').value,
            mrw_busbar: document.getElementById('mrw_busbar').value,
            mrw_reason: document.getElementById('mrw_reason').value,
            frm_rtv: document.getElementById('frm_rtv').value,
            frm_l: document.getElementById('frm_l').value,
            frm_s: document.getElementById('frm_s').value,
            frm_reason: document.getElementById('frm_reason').value,
            potting: document.getElementById('potting').value,
            potting_reason: document.getElementById('potting_reason').value,
            bus2_pos: document.getElementById('bus2_pos').value,
            bus2_neg: document.getElementById('bus2_neg').value,
            bus2_mid: document.getElementById('bus2_mid').value,
            bus2_reason: document.getElementById('bus2_reason').value,
            fg_weight: document.getElementById('fg_weight').value,
            fg_nos: document.getElementById('fg_nos').value,
            fg_reason: document.getElementById('fg_reason').value,
            bg_weight: document.getElementById('bg_weight').value,
            bg_nos: document.getElementById('bg_nos').value,
            bg_reason: document.getElementById('bg_reason').value,
            epe_weight: document.getElementById('epe_weight').value,
            epe_reason: document.getElementById('epe_reason').value
        };

        fetch(webAppUrl, {
            method: "POST",
            redirect: "follow",
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "duplicate") {
                // Shows the duplicate warning alert
                alert(data.message);
                rejFinalSubmitBtn.textContent = originalText;
                rejFinalSubmitBtn.disabled = false;
            } 
            else if (data.status === "success") {
                alert("Success! Rejection data submitted.");
                localStorage.removeItem('rejectionDraft'); // Wipes the memory for a fresh start!
                window.location.href = "home.html"; 
            }
            else {
                alert("Error saving data: " + data.message);
                rejFinalSubmitBtn.textContent = originalText;
                rejFinalSubmitBtn.disabled = false;
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Network error. Please try again.");
            rejFinalSubmitBtn.textContent = originalText;
            rejFinalSubmitBtn.disabled = false;
        });
    });
}

// =========================================
// 6. PROFILE PICTURE & UI LOGIC
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const profileOverlay = document.getElementById('profileOverlay');
    const closeProfileBtn = document.getElementById('closeProfileBtn');
    const profilePicInput = document.getElementById('profilePicInput');
    const editPicBtn = document.getElementById('editPicBtn');
    const profileImagePreview = document.getElementById('profileImagePreview');
    const saveProfilePicBtn = document.getElementById('saveProfilePicBtn');

    let compressedImageBase64 = null;

    // If the HTML isn't on this page, stop here so it doesn't crash
    if (!profileOverlay) return;

    // 1. Populate details
    const nameDisplay = document.getElementById('profileNameDisplay');
    if (nameDisplay) nameDisplay.textContent = localStorage.getItem('loggedInName') || 'Unknown User';
    
    const desigDisplay = document.getElementById('profileDesignationDisplay');
    if (desigDisplay) desigDisplay.textContent = localStorage.getItem('userDesignation') || 'Role Not Set';
    
    const userDisplay = document.getElementById('profileUsernameDisplay');
    if (userDisplay) userDisplay.textContent = localStorage.getItem('username') || '-';

    const empDisplay = document.getElementById('profileEmpIdDisplay');
    if (empDisplay) empDisplay.textContent = localStorage.getItem('userEmpId') || '-';
    
    const mobileDisplay = document.getElementById('profileMobileDisplay');
    if (mobileDisplay) mobileDisplay.textContent = localStorage.getItem('userMobile') || '-';

    const emailDisplay = document.getElementById('profileEmailDisplay');
    if (emailDisplay) emailDisplay.textContent = localStorage.getItem('userEmail') || '-';

    const storedPic = localStorage.getItem('profilePic');
    
    // 2. Replace icons with custom image if it exists
    if (storedPic) {
        if (profileImagePreview) profileImagePreview.src = storedPic;
        
        document.querySelectorAll('.fa-user-circle').forEach(icon => {
            const img = document.createElement('img');
            img.src = storedPic;
            img.className = 'nav-avatar'; 
            img.addEventListener('click', () => profileOverlay.style.display = 'flex');
            icon.parentNode.replaceChild(img, icon);
        });
    } else {
        // Attach click to the default icon
        document.querySelectorAll('.fa-user-circle').forEach(icon => {
            icon.style.cursor = "pointer";
            icon.addEventListener('click', () => {
                profileOverlay.style.display = 'flex';
            });
        });
    }

    // Close button logic
    if (closeProfileBtn) {
        closeProfileBtn.addEventListener('click', () => profileOverlay.style.display = 'none');
    }
    
    // Open file picker
    if (editPicBtn && profilePicInput) {
        editPicBtn.addEventListener('click', () => profilePicInput.click());
    }

    // 3. Compress image when user selects a file
    if (profilePicInput) {
        profilePicInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = event => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 150; 
                    const MAX_HEIGHT = 150;
                    let width = img.width, height = img.height;

                    if (width > height && width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width; width = MAX_WIDTH;
                    } else if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height; height = MAX_HEIGHT;
                    }

                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    compressedImageBase64 = canvas.toDataURL('image/jpeg', 0.6);
                    if (profileImagePreview) profileImagePreview.src = compressedImageBase64;
                    if (saveProfilePicBtn) saveProfilePicBtn.style.display = "inline-block"; 
                };
            };
        });
    }

    // 4. Send image to Google Sheets
    if (saveProfilePicBtn) {
        saveProfilePicBtn.addEventListener('click', function() {
            const originalBtnText = this.textContent;
            this.textContent = "SAVING...";
            this.disabled = true;

            // ---> PASTE YOUR GOOGLE SCRIPT URL HERE <---
            const webAppUrl = "https://script.google.com/macros/s/AKfycbxzilM5l3VvqE5ajJYYNAJIa5489E4pkLGnbXyzrj4LS80so-yWm0FZxAvG33IXGTNl/exec"; 

            fetch(webAppUrl, {
                method: "POST",
                redirect: "follow",
                body: JSON.stringify({
                    action: "updateProfilePic",
                    userId: localStorage.getItem('userId'),
                    imageBase64: compressedImageBase64
                })
            })
            .then(response => response.json())
            .then(data => {
                this.textContent = originalBtnText;
                this.disabled = false;
                if (data.status === "success") {
                    localStorage.setItem('profilePic', compressedImageBase64);
                    alert("Profile Picture Updated Successfully!");
                    location.reload(); 
                } else {
                    alert("Error: " + data.message);
                }
            })
            .catch(error => {
                this.textContent = originalBtnText;
                this.disabled = false;
                alert("System Error: " + error.message);
            });
        });
    }
});
// =========================================
// 7. HANDOVER PREVIEW & SUBMIT LOGIC
// =========================================
const previewBtn = document.getElementById('previewBtn');
const editBtn = document.getElementById('editBtn');
const finalSubmitBtn = document.getElementById('finalSubmitBtn');
const hoFormContainer = document.getElementById('hoFormContainer');
const hoPreviewContainer = document.getElementById('hoPreviewContainer');
const previewContent = document.getElementById('previewContent');

// --- 1. PREVIEW BUTTON ---
if (previewBtn) {
    previewBtn.addEventListener('click', () => {
        const date = document.getElementById('hoDate').value;
        if (!date) {
            alert("Please select a date before previewing.");
            return;
        }

        const fgWt = document.getElementById('hoFgWeight').value || "0";
        const fgNos = document.getElementById('hoFgNos').value || "0";
        const fgRsn = document.getElementById('hoFgReason').value || "N/A";
        const bgWt = document.getElementById('hoBgWeight').value || "0";
        const bgNos = document.getElementById('hoBgNos').value || "0";
        const bgRsn = document.getElementById('hoBgReason').value || "N/A";
        const bbWt = document.getElementById('hoBusbarWeight').value || "0";
        const bbRsn = document.getElementById('hoBusbarReason').value || "N/A";
        const potWt = document.getElementById('hoPottingWeight').value || "0";
        const potRsn = document.getElementById('hoPottingReason').value || "N/A";
        const cellAtw = document.getElementById('hoCellAtw').value || "0";
        const cellRew = document.getElementById('hoCellRework').value || "0";
        const cellRsn = document.getElementById('hoCellReason').value || "N/A";
        const ribRw = document.getElementById('hoRibbonRw').value || "0";
        const ribTs = document.getElementById('hoRibbonTs').value || "0";
        const ribRsn = document.getElementById('hoRibbonReason').value || "N/A";
        const jbPos = document.getElementById('hoJbPos').value || "0";
        const jbNeg = document.getElementById('hoJbNeg').value || "0";
        const jbMid = document.getElementById('hoJbMid').value || "0";
        const jbRsn = document.getElementById('hoJbReason').value || "N/A";
        const frmRtv = document.getElementById('hoFrmRtv').value || "0";
        const frmL = document.getElementById('hoFrmL').value || "0";
        const frmS = document.getElementById('hoFrmS').value || "0";
        const frmRsn = document.getElementById('hoFrmReason').value || "N/A";
        const epeWt = document.getElementById('hoEpeWeight').value || "0";
        const epeRsn = document.getElementById('hoEpeReason').value || "N/A";

        previewContent.innerHTML = `
            <div style="margin-bottom:8px;"><strong>Date:</strong> ${date}</div><hr style="border-top:1px solid #ddd; margin: 8px 0;">
            <div style="margin-bottom:8px;"><strong>Front Glass:</strong> ${fgWt} Kg, ${fgNos} Nos<br><em style="color:#666;">Reason: ${fgRsn}</em></div><hr style="border-top:1px solid #ddd; margin: 8px 0;">
            <div style="margin-bottom:8px;"><strong>Back Glass:</strong> ${bgWt} Kg, ${bgNos} Nos<br><em style="color:#666;">Reason: ${bgRsn}</em></div><hr style="border-top:1px solid #ddd; margin: 8px 0;">
            <div style="margin-bottom:8px;"><strong>Busbar (4+6)mm:</strong> ${bbWt} Kg<br><em style="color:#666;">Reason: ${bbRsn}</em></div><hr style="border-top:1px solid #ddd; margin: 8px 0;">
            <div style="margin-bottom:8px;"><strong>Potting (A+B):</strong> ${potWt} Kg<br><em style="color:#666;">Reason: ${potRsn}</em></div><hr style="border-top:1px solid #ddd; margin: 8px 0;">
            <div style="margin-bottom:8px;"><strong>Cell:</strong> ATW: ${cellAtw} Kg, Rework: ${cellRew} Kg<br><em style="color:#666;">Reason: ${cellRsn}</em></div><hr style="border-top:1px solid #ddd; margin: 8px 0;">
            <div style="margin-bottom:8px;"><strong>Ribbon:</strong> R/W: ${ribRw} Kg, TS: ${ribTs} Kg<br><em style="color:#666;">Reason: ${ribRsn}</em></div><hr style="border-top:1px solid #ddd; margin: 8px 0;">
            <div style="margin-bottom:8px;"><strong>JB:</strong> +VE: ${jbPos}, -VE: ${jbNeg}, MID: ${jbMid}<br><em style="color:#666;">Reason: ${jbRsn}</em></div><hr style="border-top:1px solid #ddd; margin: 8px 0;">
            <div style="margin-bottom:8px;"><strong>Framing:</strong> RTV: ${frmRtv} Kg, L: ${frmL}, S: ${frmS}<br><em style="color:#666;">Reason: ${frmRsn}</em></div><hr style="border-top:1px solid #ddd; margin: 8px 0;">
            <div style="margin-bottom:8px;"><strong>EPE (1st+2nd):</strong> ${epeWt} Kg<br><em style="color:#666;">Reason: ${epeRsn}</em></div>
        `;

        window.scrollTo(0, 0); 
        hoFormContainer.style.display = "none";
        hoPreviewContainer.style.display = "block";
    });
}

// --- 2. EDIT BUTTON ---
if (editBtn) {
    editBtn.addEventListener('click', () => {
        hoPreviewContainer.style.display = "none";
        hoFormContainer.style.display = "block";
    });
}


// --- 4. FINAL SUBMIT BUTTON (Single Fetch) ---
if (finalSubmitBtn) {
    finalSubmitBtn.addEventListener('click', () => {
        const originalText = finalSubmitBtn.textContent;
        finalSubmitBtn.textContent = "SUBMITTING...";
        finalSubmitBtn.disabled = true;

        // =========================================================
        // ⚠️ CRITICAL: PASTE YOUR GOOGLE WEB APP URL BELOW ⚠️
        // =========================================================
        const webAppUrl = "https://script.google.com/macros/s/AKfycbxzilM5l3VvqE5ajJYYNAJIa5489E4pkLGnbXyzrj4LS80so-yWm0FZxAvG33IXGTNl/exec";

        const payload = {
            action: "handover",
            userId: localStorage.getItem("username") || "Unknown User",
            date: document.getElementById('hoDate').value,
            fgWt: document.getElementById('hoFgWeight').value || "0",
            fgNos: document.getElementById('hoFgNos').value || "0",
            fgRsn: document.getElementById('hoFgReason').value || "N/A",
            bgWt: document.getElementById('hoBgWeight').value || "0",
            bgNos: document.getElementById('hoBgNos').value || "0",
            bgRsn: document.getElementById('hoBgReason').value || "N/A",
            bbWt: document.getElementById('hoBusbarWeight').value || "0",
            bbRsn: document.getElementById('hoBusbarReason').value || "N/A",
            potWt: document.getElementById('hoPottingWeight').value || "0",
            potRsn: document.getElementById('hoPottingReason').value || "N/A",
            cellAtw: document.getElementById('hoCellAtw').value || "0",
            cellRew: document.getElementById('hoCellRework').value || "0",
            cellRsn: document.getElementById('hoCellReason').value || "N/A",
            ribRw: document.getElementById('hoRibbonRw').value || "0",
            ribTs: document.getElementById('hoRibbonTs').value || "0",
            ribRsn: document.getElementById('hoRibbonReason').value || "N/A",
            jbPos: document.getElementById('hoJbPos').value || "0",
            jbNeg: document.getElementById('hoJbNeg').value || "0",
            jbMid: document.getElementById('hoJbMid').value || "0",
            jbRsn: document.getElementById('hoJbReason').value || "N/A",
            frmRtv: document.getElementById('hoFrmRtv').value || "0",
            frmL: document.getElementById('hoFrmL').value || "0",
            frmS: document.getElementById('hoFrmS').value || "0",
            frmRsn: document.getElementById('hoFrmReason').value || "N/A",
            epeWt: document.getElementById('hoEpeWeight').value || "0",
            epeRsn: document.getElementById('hoEpeReason').value || "N/A"
        };

        fetch(webAppUrl, {
            method: "POST",
            redirect: "follow",
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "duplicate") {
                alert(data.message);
                finalSubmitBtn.textContent = originalText;
                finalSubmitBtn.disabled = false;
            } 
            else if (data.status === "success") {
                alert("Success! Handover data sent to PPC.");
                localStorage.removeItem('handoverDraft'); // Wipes the memory for a fresh start!
                window.location.href = "home.html"; 
            }
            else {
                alert("Error saving data: " + data.message);
                finalSubmitBtn.textContent = originalText;
                finalSubmitBtn.disabled = false;
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Network error. Please try again.");
            finalSubmitBtn.textContent = originalText;
            finalSubmitBtn.disabled = false;
        });
    });
}
// =========================================
// SMART IMAGE DOWNLOADER (MOBILE & DESKTOP)
// =========================================
function saveImageSmart(imgData, fileName) {
    // Convert Base64 image to a physical file so mobile phones can handle it
    let arr = imgData.split(','), mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){ u8arr[n] = bstr.charCodeAt(n); }
    let file = new File([new Blob([u8arr], {type:mime})], fileName, {type: mime});

    // 1. Try Mobile Web Share API (Pops up native Share/WhatsApp/Gallery menu)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
            files: [file],
            title: fileName
        }).catch(err => console.log("Share cancelled by user."));
    } 
    // 2. Fallback to Desktop Browser Download
    else {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = imgData;
        link.click();
    }
}

// --- DOWNLOAD HANDOVER PREVIEW ---
const downloadJpegBtn = document.getElementById('downloadJpegBtn');
if (downloadJpegBtn) {
    downloadJpegBtn.addEventListener('click', () => {
        const originalText = downloadJpegBtn.textContent;
        downloadJpegBtn.textContent = "SAVING...";
        downloadJpegBtn.disabled = true;

        const captureArea = document.getElementById('previewContent');
        html2canvas(captureArea, { scale: 2, backgroundColor: "#ffffff" }).then(canvas => {
            const imgData = canvas.toDataURL("image/jpeg", 1.0);
            const dateVal = document.getElementById('hoDate').value || 'Data';
            saveImageSmart(imgData, `Handover_PPC_${dateVal}.jpg`);
            
            downloadJpegBtn.textContent = originalText;
            downloadJpegBtn.disabled = false;
        }).catch(err => {
            console.error("Image generation failed:", err);
            alert("Failed to generate image.");
            downloadJpegBtn.textContent = originalText;
            downloadJpegBtn.disabled = false;
        });
    });
}

// --- DOWNLOAD REJECTION PREVIEW ---
const rejDownloadJpegBtn = document.getElementById('rejDownloadJpegBtn');
if (rejDownloadJpegBtn) {
    rejDownloadJpegBtn.addEventListener('click', () => {
        const originalText = rejDownloadJpegBtn.textContent;
        rejDownloadJpegBtn.textContent = "SAVING...";
        rejDownloadJpegBtn.disabled = true;

        const captureArea = document.getElementById('rejPreviewContent');
        html2canvas(captureArea, { scale: 2, backgroundColor: "#ffffff" }).then(canvas => {
            const imgData = canvas.toDataURL("image/jpeg", 1.0);
            const dateVal = document.getElementById('rejDate').value || 'Data';
            const shiftVal = document.getElementById('rejShift').value || 'Shift';
            saveImageSmart(imgData, `Rejection_${dateVal}_Shift-${shiftVal}.jpg`);
            
            rejDownloadJpegBtn.textContent = originalText;
            rejDownloadJpegBtn.disabled = false;
        }).catch(err => {
            console.error("Image generation failed:", err);
            alert("Failed to generate image.");
            rejDownloadJpegBtn.textContent = originalText;
            rejDownloadJpegBtn.disabled = false;
        });
    });
}
// =========================================
// AUTO-SAVE DRAFT LOGIC (RESUME WHERE LEFT OFF)
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // Universal function to save and load drafts for any form container
    function setupAutoSave(containerId, storageKey) {
        const container = document.getElementById(containerId);
        if (!container) return; // Skip if we aren't on this page

        // 1. Load saved data immediately when the screen opens
        const savedDraft = localStorage.getItem(storageKey);
        if (savedDraft) {
            const parsedDraft = JSON.parse(savedDraft);
            const inputs = container.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
                // If the memory has a value for this input box, fill it in!
                if (input.id && parsedDraft[input.id] !== undefined) {
                    input.value = parsedDraft[input.id];
                }
            });
        }

        // 2. Listen for ANY typing or changes, and save instantly
        container.addEventListener('input', () => {
            const currentData = {};
            const inputs = container.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
                if (input.id) {
                    currentData[input.id] = input.value;
                }
            });
            
            // Save the entire form's current state to the phone's memory
            localStorage.setItem(storageKey, JSON.stringify(currentData));
        });
    }

    // Activate for both Handover and Rejection screens
    setupAutoSave('hoFormContainer', 'handoverDraft');
    setupAutoSave('rejectionDataForm', 'rejectionDraft');
});
