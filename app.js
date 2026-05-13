const API_URL = 'https://script.google.com/macros/s/AKfycbww9Itv9SDH_7CGy99v1S9K7tMq43Jac6tqEhbM0xZyG8Q93fPQtvmnqT-9aa3sPTfpsg/exec';

protectDashboard();

let currentRow = null;
let currentBarcode = null;
let currentName = null;

/* =========================================================
   AUTO FOCUS
========================================================= */
function focusBarcode() {
  const input = document.getElementById('barcode');
  if (!input) return;

  input.focus();
  input.select();
}

/* =========================================================
   PAGE LOAD
========================================================= */
window.addEventListener('load', () => {
  focusBarcode();
  updateClock();
  loadDashboardStats();
});

/* =========================================================
   KEEP FOCUS
========================================================= */
document.addEventListener('click', () => {
  setTimeout(focusBarcode, 100);
});

/* =========================================================
   LIVE CLOCK
========================================================= */
function updateClock() {
  const clock = document.getElementById('liveClock');

  if (clock) {
    clock.textContent = new Date().toLocaleTimeString();
  }
}

setInterval(updateClock, 1000);

/* =========================================================
   ENTER KEY SUPPORT
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const barcodeInput = document.getElementById('barcode');

  if (barcodeInput) {
    barcodeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        scanBarcode();
      }
    });
  }
});

/* =========================================================
   SCAN BARCODE
========================================================= */
async function scanBarcode() {
  const barcodeInput = document.getElementById('barcode');
  const barcode = barcodeInput.value.trim();

  if (!barcode) {
    focusBarcode();
    return;
  }

showLoader("Searching Student...");

  try {
    const response = await fetch(
      `${API_URL}?action=search&query=${encodeURIComponent(barcode)}`
    );

    const data = await response.json();

    if (data.status === 'success') {
      currentRow = data.row;
      currentBarcode = data.student.barcode;
      currentName = data.student.name;

      // Student info
      document.getElementById('studentName').textContent =
        data.student.name || 'No Student Loaded';

      document.getElementById('faculty').textContent =
        data.student.faculty || '-';

      document.getElementById('batch').textContent =
        data.student.batch || '-';

      // Attendance badge
      document.getElementById('attendance').innerHTML =
        '<span class="status-badge present">PRESENT</span>';

      // Clear and refocus
      barcodeInput.value = '';

      // Reset buttons
      resetActionButtons();
      
      highlightCompletedButtons(data.student);

      
      showToast(
  `Student Loaded: ${data.student.name}`,
  'success'
);

	hideLoader(); 
      focusBarcode();

    } else {
      hideLoader();
      showToast('Student Not Found', 'warning');
      barcodeInput.value = '';
      focusBarcode();
    }

  } catch (error) {
    hideLoader();
    console.error(error);
    showToast('Connection Error', 'error');
    focusBarcode();
  }
}




function highlightCompletedButtons(student) {
  const mappings = [
    {
      selector: '[data-field="Main_Lunch_Pack"]',
      value: student.main_lunch,
      expected: 'ISSUED'
    },
    {
      selector: '[data-field="Extra_Lunch_Pack"]',
      value: student.extra_lunch,
      expected: 'ISSUED'
    },
    {
      selector: '[data-field="Cloak_Status"]',
      value: student.cloak_status,
      expected: 'ISSUED'
    },
    {
      selector: '[data-field="Photo_1"]',
      value: student.photo_1,
      expected: 'DONE'
    },
    {
      selector: '[data-field="Photo_2"]',
      value: student.photo_2,
      expected: 'DONE'
    },
    {
      selector: '[data-field="Photo_3"]',
      value: student.photo_3,
      expected: 'DONE'
    },
    {
      selector: '[data-field="Photo_4"]',
      value: student.photo_4,
      expected: 'DONE'
    }
  ];

  mappings.forEach(item => {
    const btn = document.querySelector(item.selector);

    if (
      btn &&
      String(item.value || '').trim().toUpperCase() === item.expected
    ) {
      btn.classList.add('completed');
      btn.disabled = true;
    }
  });
}








/* =========================================================
   UPDATE FIELD
========================================================= */



async function updateField(field, value, buttonElement = null) {
  if (!currentRow) {
    showToast('Please load a student first', 'warning');
    focusBarcode();
    loadDashboardStats();
    return;
  }

  const payload = {
    action: 'update',
    row: currentRow,
    barcode: currentBarcode,
    name: currentName,
    field: field,
    value: value,
    updatedBy: 'Reception_01'
  };

showLoader("Updating Data...");

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors', // IMPORTANT
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // In no-cors mode, we cannot read response.json()
    // So we assume success if no fetch error occurs.

    if (buttonElement) {
      buttonElement.classList.add('completed');
      buttonElement.disabled = true;
    }


hideLoader();

showToast(
  field.replace(/_/g, ' ') + ' updated successfully',
  'success'
);

loadDashboardStats();



    // Update attendance badge if needed
    if (field === 'Attendance_Status') {
      document.getElementById('attendance').innerHTML =
        '<span class="status-badge present">PRESENT</span>';
    }

    focusBarcode();

  } catch (error) {
    hideLoader();
    console.error(error);
    showToast('Update Failed: ' + error.message, 'error');
    focusBarcode();
  }
}







/* =========================================================
   RESET BUTTONS
========================================================= */
function resetActionButtons() {
  const buttons = document.querySelectorAll('.action-btn');

  buttons.forEach(btn => {
    btn.classList.remove('completed');
    btn.disabled = false;
  });
}




/* =========================================================
   LOAD DASHBOARD STATISTICS
========================================================= */
async function loadDashboardStats() {
  try {
    const response = await fetch(`${API_URL}?action=stats`);
    const data = await response.json();

    if (data.status === 'success') {
      document.getElementById('studentsCount').textContent =
        data.totalStudents || 0;

      document.getElementById('presentCount').textContent =
        data.presentCount || 0;

      document.getElementById('mealCount').textContent =
        data.mealsIssued || 0;

      document.getElementById('photoCount').textContent =
        data.photosCompleted || 0;
    }
  } catch (error) {
    console.error('Dashboard stats error:', error);
  }
}


function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}







/* =========================================
   LOADING OVERLAY
========================================= */
function showLoader(text = "Loading...") {
    const overlay = document.getElementById("loadingOverlay");
    const loadingText = document.getElementById("loadingText");

    if (loadingText) {
        loadingText.textContent = text;
    }

    if (overlay) {
        overlay.classList.remove("hidden");
    }
}

function hideLoader() {
    const overlay = document.getElementById("loadingOverlay");

    if (overlay) {
        overlay.classList.add("hidden");
    }
}





setInterval(loadDashboardStats, 5000);




