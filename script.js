// =========================================================
// ⚠️ CRITICAL: PASTE YOUR GOOGLE WEB APP URL BELOW ⚠️
// =========================================================
const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyLDObudY7pBOmwv9pdPkYNIY1EmFiE7A3DbaWkQEM0wWK6hZ7odSh9i2GJlaNh_cIw/exec"; 

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
        const webAppUrl = APP_SCRIPT_URL; 

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
    
    const insightsBtn = document.getElementById('insightsBtn');
    const chartOverlay = document.getElementById('chartOverlay');

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

    if (insightsBtn && chartOverlay) {
        insightsBtn.addEventListener('click', () => chartOverlay.style.display = 'flex');
        chartOverlay.addEventListener('click', (e) => {
            if (e.target === chartOverlay) chartOverlay.style.display = 'none';
        });
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
        const webAppUrl = "https://script.google.com/macros/s/AKfycbyLDObudY7pBOmwv9pdPkYNIY1EmFiE7A3DbaWkQEM0wWK6hZ7odSh9i2GJlaNh_cIw/exec";

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
            const webAppUrl = "https://script.google.com/macros/s/AKfycbyLDObudY7pBOmwv9pdPkYNIY1EmFiE7A3DbaWkQEM0wWK6hZ7odSh9i2GJlaNh_cIw/exec"; 

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
        const webAppUrl = "https://script.google.com/macros/s/AKfycbyLDObudY7pBOmwv9pdPkYNIY1EmFiE7A3DbaWkQEM0wWK6hZ7odSh9i2GJlaNh_cIw/exec";

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
// =========================================
// FETCH AND DISPLAY REJECTION REPORTS
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const reportContainer = document.getElementById('reportContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // Only run this script if we are actually on the reports.html page
    if (reportContainer && loadingIndicator) {
        
        // REPLACE THIS WITH YOUR LIVE DEPLOYED APP SCRIPT URL
        const scriptURL = "https://script.google.com/macros/s/AKfycbyLDObudY7pBOmwv9pdPkYNIY1EmFiE7A3DbaWkQEM0wWK6hZ7odSh9i2GJlaNh_cIw/exec"; 

        const payload = { action: "getRejectionReports" };

        fetch(scriptURL, {
            method: 'POST',
            mode: 'no-cors', // Use standard no-cors for Google form routing
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(payload)
        })
        .then(() => {
            // Because no-cors makes reading the exact JSON response difficult natively without a GET request,
            // the most robust way to read Google Sheets data on a frontend is to alter our fetch slightly.
            // Let's use a standard fetch block that reads the JSON.
        });

        // ---------------------------------------------------------
        // PREFERRED METHOD FOR READING GOOGLE SCRIPT JSON RETURNS:
        // ---------------------------------------------------------
        fetch(scriptURL, {
            redirect: "follow",
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        })
        .then(response => response.json())
        .then(data => {
            loadingIndicator.style.display = "none";
            reportContainer.style.display = "block";

          if (data.status === "success" && data.data.length > 0) {
                
                // Show the containers
                document.getElementById('chartContainer').style.display = "block";
                reportContainer.style.display = "block";

                // ==========================================
                // 1. PROCESS DATA FOR CLUSTERED COLUMN CHART
                // ==========================================
                const chartData = {};
                const allShifts = new Set();

                // Group data by Date, then by Shift
                data.data.forEach(row => {
                    // Assuming Col A (0) is Date, Col B (1) is Shift
                    const rawDate = row[0];
                    const dateStr = rawDate ? new Date(rawDate).toLocaleDateString() : "N/A";
                    const shiftStr = row[1] || "Unknown";

                    allShifts.add(shiftStr);

                    if (!chartData[dateStr]) chartData[dateStr] = {};
                    if (!chartData[dateStr][shiftStr]) chartData[dateStr][shiftStr] = 0;
                    
                    chartData[dateStr][shiftStr]++; // Count the rejection
                });

                // Extract unique Dates for X-Axis
                const labels = Object.keys(chartData);
                // Extract unique Shifts for the clustered bars
                const uniqueShifts = Array.from(allShifts); 

                // Theme colors for your different shifts
                const colors = ['#6a1b9a', '#dc3545', '#ffc107', '#28a745'];

                const datasets = uniqueShifts.map((shift, index) => {
                    return {
                        label: `Shift ${shift}`,
                        data: labels.map(date => chartData[date][shift] || 0), // Get count or 0
                        backgroundColor: colors[index % colors.length], // Assign color
                        borderRadius: 4 // Rounded tops on the bars
                    };
                });

                // Draw the Chart.js Chart
                const ctx = document.getElementById('rejectionChart').getContext('2d');
                new Chart(ctx, {
                    type: 'bar', // 'bar' creates column charts in Chart.js
                    data: {
                        labels: labels,
                        datasets: datasets
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: { display: true, text: 'Rejections by Date & Shift' },
                            legend: { position: 'bottom' }
                        },
                        scales: {
                            x: { stacked: false }, // false = clustered columns side-by-side
                            y: { stacked: false, beginAtZero: true, ticks: { stepSize: 1 } }
                        }
                    }
                });

                // ==========================================
                // 2. GENERATE THE TEXT CARDS (Below the chart)
                // ==========================================
                const recentData = data.data.reverse().slice(0, 50); 
                
                recentData.forEach(row => {
                    const dateVal = row[0] ? new Date(row[0]).toLocaleDateString() : "N/A";
                    const shiftVal = row[1] || "N/A";
                    const moduleVal = row[2] || "N/A"; // Adjust index for Module ID

                    const card = document.createElement('div');
                    card.className = 'report-card';
                    card.innerHTML = `
                        <h4>Module: ${moduleVal}</h4>
                        <p><strong>Date:</strong> ${dateVal}</p>
                        <p><strong>Shift:</strong> ${shiftVal}</p>
                        <p><strong>Status:</strong> Rejected</p>
                    `;
                    reportContainer.appendChild(card);
                });

            } else {
                reportContainer.style.display = "block";
                reportContainer.innerHTML = "<p style='padding: 15px;'>No rejection data found.</p>";
            }
        })
        .catch(error => {
            console.error("Error fetching reports:", error);
            loadingIndicator.innerHTML = "<p style='color:red;'>Failed to load data. Check network.</p>";
        });
    }
}); 
// =========================================
// REJECTION SUMMARY PAGE LOGIC
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const summaryApplyBtn = document.getElementById('summaryApplyBtn');
    const summaryLoading = document.getElementById('summaryLoading');
    const summaryContent = document.getElementById('summaryContent');
    const summaryActions = document.getElementById('summaryActions');
    const noDataMessage = document.getElementById('noDataMessage');
    const selectedInfo = document.getElementById('selectedInfo');
    const summaryError = document.getElementById('summaryError');
    const downloadExcelBtn = document.getElementById('downloadExcelBtn');

    // Only run if we are on summary.html
    if (!summaryApplyBtn) return;

    // Set default date to today
    const summaryDateInput = document.getElementById('summaryDate');
    if (summaryDateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        summaryDateInput.value = `${yyyy}-${mm}-${dd}`;
    }

    // =============================================
    // COLUMN INDEX MAP (matches rejection payload)
    // Adjust these if your Google Sheet column order differs
    // =============================================
    const isHandover = document.title.toLowerCase().includes('handover');

    const COL = isHandover ? {
        TIMESTAMP: 0,
        SUBMITTED_BY: 1,
        DATE: 2,
        FG_WEIGHT: 3,
        FG_NOS: 4,
        FG_REASON: 5,
        BG_WEIGHT: 6,
        BG_NOS: 7,
        BG_REASON: 8,
        BUS_WEIGHT: 9,
        BUS_REASON: 10,
        POTTING_WEIGHT: 11,
        POTTING_REASON: 12,
        CELL_ATW: 13,
        CELL_REWORK: 14,
        CELL_REASON: 15,
        RIBBON_RW: 16,
        RIBBON_TS: 17,
        RIBBON_REASON: 18,
        JB_POS: 19,
        JB_NEG: 20,
        JB_MID: 21,
        JB_REASON: 22,
        FRM_RTV: 23,
        FRM_L: 24,
        FRM_S: 25,
        FRM_REASON: 26,
        EPE_WEIGHT: 27,
        EPE_REASON: 28
    } : {
        TIMESTAMP: 0,
        SUBMITTED_BY: 1,
        DATE: 2,
        SHIFT: 3,
        STR_CELL: 4,
        STR_RIBBON: 5,
        STR_REASON: 6,
        BUS_4MM: 7,
        BUS_6MM: 8,
        BUS_REASON: 9,
        SRW_CELL: 10,
        SRW_RIBBON: 11,
        SRW_REASON: 12,
        MRW_CELL: 13,
        MRW_RIBBON: 14,
        MRW_BUSBAR: 15,
        MRW_REASON: 16,
        FRM_RTV: 17,
        FRM_L: 18,
        FRM_S: 19,
        FRM_REASON: 20,
        POTTING: 21,
        POTTING_REASON: 22,
        BUS2_POS: 23,
        BUS2_NEG: 24,
        BUS2_MID: 25,
        BUS2_REASON: 26,
        FG_WEIGHT: 27,
        FG_NOS: 28,
        FG_REASON: 29,
        BG_WEIGHT: 30,
        BG_NOS: 31,
        BG_REASON: 32,
        EPE_WEIGHT: 33,
        EPE_REASON: 34
    };

    // =============================================
    // APPLY BUTTON — Fetch & Process on Click
    // =============================================
    summaryApplyBtn.addEventListener('click', () => {
        // Get selected shifts (Only for Rejection Summary)
        const selectedShifts = [];
        if (!isHandover) {
            const sA = document.getElementById('shiftA');
            const sB = document.getElementById('shiftB');
            const sC = document.getElementById('shiftC');
            if (sA && sA.checked) selectedShifts.push('A');
            if (sB && sB.checked) selectedShifts.push('B');
            if (sC && sC.checked) selectedShifts.push('C');
        }

        if (!isHandover && selectedShifts.length === 0) {
            alert("Please select at least one shift.");
            return;
        }

        const selectedDate = summaryDateInput ? summaryDateInput.value : '';

        // Show loading, hide previous results
        summaryLoading.style.display = "block";
        summaryContent.style.display = "none";
        summaryActions.style.display = "none";
        noDataMessage.style.display = "none";
        if (summaryError) summaryError.style.display = "none";
        if (selectedInfo) selectedInfo.style.display = "none";

        // Disable button while loading
        summaryApplyBtn.textContent = "LOADING...";
        summaryApplyBtn.disabled = true;

        // Uses the global APP_SCRIPT_URL defined at the top of script.js
        const scriptURL = typeof APP_SCRIPT_URL !== 'undefined' ? APP_SCRIPT_URL : "https://script.google.com/macros/s/AKfycbyLDObudY7pBOmwv9pdPkYNIY1EmFiE7A3DbaWkQEM0wWK6hZ7odSh9i2GJlaNh_cIw/exec";
        const payload = { action: isHandover ? "getHandoverReports" : "getRejectionReports" };
        console.log("SENDING PAYLOAD TO GOOGLE:", payload);

        // Try fetching with JSON body (standard approach)
        fetch(scriptURL, {
            method: 'POST',
            redirect: "follow",
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) throw new Error("Server error: " + response.status);
            return response.json();
        })
        .then(data => {
            console.log("Summary data received:", data.status, "Rows:", data.data ? data.data.length : 0);
            if (data.data && data.data.length > 0) {
                console.log("First row columns:", data.data[0].length, "Sample:", JSON.stringify(data.data[0]).substring(0, 200));
            }
            processData(data, selectedDate, selectedShifts);
        })
        .catch(error => {
            console.warn("JSON fetch failed, trying URLSearchParams...", error.message);
            // Fallback: try URLSearchParams format
            fetch(scriptURL + "?" + new URLSearchParams(payload).toString(), {
                redirect: "follow",
                method: 'GET'
            })
            .then(response => response.json())
            .then(data => {
                processData(data, selectedDate, selectedShifts);
            })
            .catch(error2 => {
                console.error("Both fetch methods failed:", error2);
                summaryLoading.style.display = "none";
                resetApplyBtn();
                if (summaryError) {
                    summaryError.style.display = "block";
                    summaryError.innerHTML = `<i class="fas fa-exclamation-triangle"></i><br><strong>Failed to load data</strong><br><small>${error.message}</small>`;
                }
            });
        });
    });

    function resetApplyBtn() {
        summaryApplyBtn.innerHTML = '<i class="fas fa-search"></i> &nbsp;SHOW SUMMARY';
        summaryApplyBtn.disabled = false;
    }

    // =============================================
    // PROCESS & RENDER DATA
    // =============================================
    function safeNum(val) {
        const n = parseFloat(val);
        return isNaN(n) ? 0 : n;
    }

    function processData(data, selectedDate, selectedShifts) {
        summaryLoading.style.display = "none";
        resetApplyBtn();

        if (!data || data.status !== "success" || !data.data || data.data.length === 0) {
            noDataMessage.style.display = "block";
            if (data && data.message) {
                noDataMessage.innerHTML = `<i class="fas fa-inbox"></i><p>No data found.</p><p style="font-size:12px;color:#aaa;">${data.message}</p>`;
            }
            return;
        }

        // Filter rows by selected date and shifts
        const filteredRows = data.data.filter(row => {
            const rowDate = row[COL.DATE];
            const rowShift = row[COL.SHIFT];

            // Date matching
            let dateMatch = true;
            if (selectedDate) {
                let rowDateStr = '';
                if (rowDate) {
                    const d = new Date(rowDate);
                    if (!isNaN(d.getTime())) {
                        rowDateStr = d.getFullYear() + '-' + 
                                     String(d.getMonth() + 1).padStart(2, '0') + '-' + 
                                     String(d.getDate()).padStart(2, '0');
                    }
                }
                dateMatch = (rowDateStr === selectedDate);
            }

            // Shift matching
            const shiftStr = (rowShift || '').toString().trim().toUpperCase();
            const shiftMatch = isHandover ? true : selectedShifts.map(s => s.toUpperCase()).includes(shiftStr);

            return dateMatch && shiftMatch;
        });

        if (filteredRows.length === 0) {
            noDataMessage.style.display = "block";
            noDataMessage.innerHTML = `<i class="fas fa-inbox"></i><p>No data found for the selected criteria.</p>`;
            return;
        }

        // Aggregate totals
        const totals = {
            cell: 0, ribbon: 0, busbar: 0, rtv: 0,
            frameL: 0, frameS: 0, potting: 0,
            jbPos: 0, jbNeg: 0, jbMid: 0,
            fgWeight: 0, fgNos: 0,
            bgWeight: 0, bgNos: 0, epe: 0
        };

        filteredRows.forEach(row => {
            if (isHandover) {
                totals.cell += safeNum(row[COL.CELL_ATW]) + safeNum(row[COL.CELL_REWORK]);
                totals.ribbon += safeNum(row[COL.RIBBON_RW]) + safeNum(row[COL.RIBBON_TS]);
                totals.busbar += safeNum(row[COL.BUS_WEIGHT]);
                totals.rtv += safeNum(row[COL.FRM_RTV]);
                totals.frameL += safeNum(row[COL.FRM_L]);
                totals.frameS += safeNum(row[COL.FRM_S]);
                totals.potting += safeNum(row[COL.POTTING_WEIGHT]);
                totals.jbPos += safeNum(row[COL.JB_POS]);
                totals.jbNeg += safeNum(row[COL.JB_NEG]);
                totals.jbMid += safeNum(row[COL.JB_MID]);
                totals.fgWeight += safeNum(row[COL.FG_WEIGHT]);
                totals.fgNos += safeNum(row[COL.FG_NOS]);
                totals.bgWeight += safeNum(row[COL.BG_WEIGHT]);
                totals.bgNos += safeNum(row[COL.BG_NOS]);
                totals.epe += safeNum(row[COL.EPE_WEIGHT]);
            } else {
                totals.cell += safeNum(row[COL.STR_CELL]) + safeNum(row[COL.SRW_CELL]) + safeNum(row[COL.MRW_CELL]);
                totals.ribbon += safeNum(row[COL.STR_RIBBON]) + safeNum(row[COL.SRW_RIBBON]) + safeNum(row[COL.MRW_RIBBON]);
                totals.busbar += safeNum(row[COL.BUS_4MM]) + safeNum(row[COL.BUS_6MM]) + safeNum(row[COL.MRW_BUSBAR]);
                totals.rtv += safeNum(row[COL.FRM_RTV]);
                totals.frameL += safeNum(row[COL.FRM_L]);
                totals.frameS += safeNum(row[COL.FRM_S]);
                totals.potting += safeNum(row[COL.POTTING]);
                totals.jbPos += safeNum(row[COL.BUS2_POS]);
                totals.jbNeg += safeNum(row[COL.BUS2_NEG]);
                totals.jbMid += safeNum(row[COL.BUS2_MID]);
                totals.fgWeight += safeNum(row[COL.FG_WEIGHT]);
                totals.fgNos += safeNum(row[COL.FG_NOS]);
                totals.bgWeight += safeNum(row[COL.BG_WEIGHT]);
                totals.bgNos += safeNum(row[COL.BG_NOS]);
                totals.epe += safeNum(row[COL.EPE_WEIGHT]);
            }
        });

        const grandTotalKg = totals.cell + totals.ribbon + totals.busbar + totals.rtv +
                             totals.potting + totals.fgWeight + totals.bgWeight + totals.epe;

        const tableRows = [
            { material: "Cell", value: totals.cell.toFixed(2), unit: "Kg" },
            { material: "Ribbon", value: totals.ribbon.toFixed(2), unit: "Kg" },
            { material: "Busbar", value: totals.busbar.toFixed(2), unit: "Kg" },
            { material: "RTV", value: totals.rtv.toFixed(2), unit: "Kg" },
            { material: "Frame L", value: totals.frameL, unit: "Qty" },
            { material: "Frame S", value: totals.frameS, unit: "Qty" },
            { material: "Potting", value: totals.potting.toFixed(2), unit: "Kg" },
            { material: "JB +VE", value: totals.jbPos, unit: "Qty" },
            { material: "JB -VE", value: totals.jbNeg, unit: "Qty" },
            { material: "JB MID", value: totals.jbMid, unit: "Qty" },
            { material: "Front Glass (Wt)", value: totals.fgWeight.toFixed(2), unit: "Kg" },
            { material: "Front Glass (Nos)", value: totals.fgNos, unit: "Nos" },
            { material: "Back Glass (Wt)", value: totals.bgWeight.toFixed(2), unit: "Kg" },
            { material: "Back Glass (Nos)", value: totals.bgNos, unit: "Nos" },
            { material: "EPE", value: totals.epe.toFixed(2), unit: "Kg" }
        ];

        // Show filter info
        const dateDisplay = selectedDate || "All Dates";
        if (selectedInfo) {
            selectedInfo.style.display = "block";
            if (isHandover) {
                selectedInfo.innerHTML = `<strong>Date:</strong> ${dateDisplay} &nbsp;|&nbsp; <strong>Records:</strong> ${filteredRows.length}`;
            } else {
                selectedInfo.innerHTML = `<strong>Date:</strong> ${dateDisplay} &nbsp;|&nbsp; <strong>Shift:</strong> ${selectedShifts.join(', ')} &nbsp;|&nbsp; <strong>Records:</strong> ${filteredRows.length}`;
            }
        }

        // Build table HTML
        let tableHTML = `
            <div class="summary-table-wrapper">
                <table class="summary-table">
                    <thead>
                        <tr>
                            <th>Material</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>`;

        tableRows.forEach(r => {
            tableHTML += `
                        <tr>
                            <td>${r.material} <span class="unit-label">(${r.unit})</span></td>
                            <td>${r.value}</td>
                        </tr>`;
        });

        tableHTML += `
                    </tbody>
                </table>
            </div>`;

        summaryContent.innerHTML = tableHTML;
        summaryContent.style.display = "block";
        summaryActions.style.display = "flex";

        // Store for Excel download
        summaryContent._tableData = tableRows;
        summaryContent._grandTotal = grandTotalKg;
        summaryContent._filterInfo = {
            date: dateDisplay,
            shifts: selectedShifts.join(', '),
            records: filteredRows.length
        };
    }

    // =============================================
    // DOWNLOAD LOGIC (Dropdown: Excel, PDF, JPEG)
    // =============================================
    const downloadDropdownContainer = document.getElementById('downloadDropdownContainer');
    const downloadDropdownBtn = document.getElementById('downloadDropdownBtn');
    const dlExcel = document.getElementById('dlExcel');
    const dlPdf = document.getElementById('dlPdf');
    const dlJpeg = document.getElementById('dlJpeg');

    if (downloadDropdownBtn) {
        // Toggle Dropdown
        downloadDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            downloadDropdownContainer.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            if (downloadDropdownContainer.classList.contains('show')) {
                downloadDropdownContainer.classList.remove('show');
            }
        });

        // 1. Download Excel
        dlExcel.addEventListener('click', (e) => {
            e.preventDefault();
            downloadDropdownContainer.classList.remove('show');
            if (!summaryContent._tableData) return alert("No data to download.");
            const tableData = summaryContent._tableData;
            const filterInfo = summaryContent._filterInfo;
            const wsData = [
                ["Rejection Summary Report"],
                ["Generated:", new Date().toLocaleString()],
                ["Date:", filterInfo.date],
                ["Shifts:", filterInfo.shifts],
                ["Total Records:", filterInfo.records],
                [],
                ["Material", "Unit", "Total"]
            ];
            tableData.forEach(r => wsData.push([r.material, r.unit, parseFloat(r.value) || 0]));
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            ws['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 15 }];
            XLSX.utils.book_append_sheet(wb, ws, "Rejection Summary");
            XLSX.writeFile(wb, `Rejection_Summary_${new Date().toISOString().slice(0, 10)}.xlsx`);
        });

        function buildExportHTML(widthPx) {
            const tableData = summaryContent._tableData;
            const filterInfo = summaryContent._filterInfo;
            
            let filterText = `<strong>Date:</strong> ${filterInfo.date} &nbsp;|&nbsp; <strong>Records:</strong> ${filterInfo.records}`;
            if (!isHandover) {
                filterText = `<strong>Date:</strong> ${filterInfo.date} &nbsp;|&nbsp; <strong>Shifts:</strong> ${filterInfo.shifts} &nbsp;|&nbsp; <strong>Records:</strong> ${filterInfo.records}`;
            }

            let html = `
                <div id="exportWrapper" style="font-family: Arial, sans-serif; padding: 20px; width: ${widthPx}px; background: white; box-sizing: border-box;">
                    <h2 style="color: #6a1b9a; text-align: center; margin-top: 0; font-size: 18px;">${isHandover ? 'Handover Summary' : 'Rejection Summary Report'}</h2>
                    <div style="font-size: 13px; color: #444; margin-bottom: 15px; padding: 10px; background: #f9f5fc; border-left: 4px solid #6a1b9a; border-radius: 4px;">
                        ${filterText}
                    </div>
                    <table style="width: 100%; max-width: 480px; margin: 0 auto; border-collapse: collapse; font-size: 14px; border: 1px solid #ddd;">
                        <thead>
                            <tr>
                                <th style="background-color: #6a1b9a; color: white; padding: 10px; text-align: left; font-weight: bold;">Material</th>
                                <th style="background-color: #6a1b9a; color: white; padding: 10px; text-align: right; font-weight: bold;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            tableData.forEach((r, index) => {
                const bg = index % 2 === 0 ? "#ffffff" : "#f9f5fc";
                html += `
                            <tr style="background-color: ${bg}; border-bottom: 1px solid #eee;">
                                <td style="padding: 10px; color: #333;">${r.material} <span style="color:#999;font-size:12px;">(${r.unit})</span></td>
                                <td style="padding: 10px; text-align: right; font-weight: bold; color: #6a1b9a;">${r.value}</td>
                            </tr>
                `;
            });
            html += `
                        </tbody>
                    </table>
                </div>
            `;
            return html;
        }

        // 2. Download PDF
        dlPdf.addEventListener('click', (e) => {
            e.preventDefault();
            downloadDropdownContainer.classList.remove('show');
            if (!summaryContent._tableData) return alert("No data to download.");
            
            // Create a temporary hidden container in the DOM to measure its exact height
            const pdfContainer = document.createElement('div');
            pdfContainer.style.position = "absolute";
            pdfContainer.style.left = "0";
            pdfContainer.style.top = "0";
            pdfContainer.style.zIndex = "-9999";
            pdfContainer.style.opacity = "0"; 
            pdfContainer.innerHTML = buildExportHTML(700); 
            
            document.body.appendChild(pdfContainer);
            
            const fullHeight = pdfContainer.firstElementChild.scrollHeight + 100;

            html2pdf().set({
                margin: 10,
                filename: `${isHandover ? 'Handover' : 'Rejection'}_Summary_${new Date().toISOString().slice(0, 10)}.pdf`,
                image: { type: 'jpeg', quality: 1.0 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true, 
                    scrollY: 0, 
                    windowHeight: fullHeight 
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            }).from(pdfContainer.firstElementChild).save().then(() => {
                document.body.removeChild(pdfContainer);
            });
        });

        // 3. Download JPEG
        dlJpeg.addEventListener('click', (e) => {
            e.preventDefault();
            downloadDropdownContainer.classList.remove('show');
            if (!summaryContent._tableData) return alert("No data to download.");
            
            const snapContainer = document.createElement('div');
            snapContainer.style.position = "absolute";
            snapContainer.style.left = "0";
            snapContainer.style.top = "0";
            snapContainer.style.zIndex = "-9999"; 
            snapContainer.style.opacity = "0"; // Invisible but in DOM
            snapContainer.innerHTML = buildExportHTML(380); 
            
            document.body.appendChild(snapContainer);
            
            html2canvas(snapContainer.firstElementChild, { 
                backgroundColor: "#ffffff", 
                scale: 2,
                scrollY: 0,
                windowHeight: snapContainer.firstElementChild.scrollHeight + 50
            }).then(canvas => {
                const link = document.createElement("a");
                link.download = `${isHandover ? 'Handover' : 'Rejection'}_Summary_${new Date().toISOString().slice(0, 10)}.jpg`;
                link.href = canvas.toDataURL("image/jpeg", 1.0);
                link.click();
                document.body.removeChild(snapContainer);
            });
        });
    }
});
