const URL = 'https://neapdsjsqpcsxhxjwyik.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYXBkc2pzcXBjc3hoeGp3eWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0Nzg0NjgsImV4cCI6MjA5NDA1NDQ2OH0.0MK6HwbDBA9jTj-_ESG[...]
const _supabase = supabase.createClient(URL, KEY);

const repairForm = document.getElementById('repairForm');
const stepsList = document.getElementById('stepsList');
const logTableBody = document.getElementById('logTableBody');
const modal = document.getElementById('detailModal');
const dateInput = document.getElementById('repairDate');
const dateDisplay = document.getElementById('repairDateDisplay');
const datePickerContainer = document.getElementById('datePickerContainer');
const datePickerDays = document.getElementById('datePickerDays');
const monthYearDisplay = document.getElementById('monthYearDisplay');

let compressedBase64 = null;
let currentPickerDate = new Date();

document.addEventListener('DOMContentLoaded', () => {
    initDatePicker();
    setDefaultDate();
    fetchLogs();
});

// ========== DATE PICKER INITIALIZATION ==========
function initDatePicker() {
    const displayInput = document.getElementById('repairDateDisplay');
    const pickerIcon = document.querySelector('.date-picker-icon');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const todayBtn = document.getElementById('todayBtn');
    const clearBtn = document.getElementById('clearBtn');

    // Toggle date picker on input click
    displayInput.addEventListener('click', () => {
        datePickerContainer.style.display = datePickerContainer.style.display === 'none' ? 'block' : 'none';
        if (datePickerContainer.style.display === 'block') {
            renderDatePicker();
        }
    });

    // Toggle date picker on icon click
    pickerIcon.addEventListener('click', () => {
        datePickerContainer.style.display = datePickerContainer.style.display === 'none' ? 'block' : 'none';
        if (datePickerContainer.style.display === 'block') {
            renderDatePicker();
        }
    });

    // Navigation buttons
    prevMonthBtn.addEventListener('click', (e) => {
        e.preventDefault();
        currentPickerDate.setMonth(currentPickerDate.getMonth() - 1);
        renderDatePicker();
    });

    nextMonthBtn.addEventListener('click', (e) => {
        e.preventDefault();
        currentPickerDate.setMonth(currentPickerDate.getMonth() + 1);
        renderDatePicker();
    });

    // Today button
    todayBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const today = new Date();
        selectDate(today);
    });

    // Clear button
    clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        dateInput.value = '';
        dateDisplay.value = '';
        datePickerContainer.style.display = 'none';
    });

    // Close picker when clicking outside
    document.addEventListener('click', (e) => {
        const wrapper = document.querySelector('.date-picker-wrapper');
        if (!wrapper.contains(e.target)) {
            datePickerContainer.style.display = 'none';
        }
    });
}

function renderDatePicker() {
    const year = currentPickerDate.getFullYear();
    const month = currentPickerDate.getMonth();

    // Update header
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

    // Clear previous days
    datePickerDays.innerHTML = '';

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    // Previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'date-day other-month';
        dayDiv.textContent = daysInPrevMonth - i;
        datePickerDays.appendChild(dayDiv);
    }

    // Current month's days
    const today = new Date();
    const selectedDate = dateInput.value ? new Date(dateInput.value) : null;

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'date-day';
        dayDiv.textContent = day;

        const date = new Date(year, month, day);

        // Check if it's today
        if (date.toDateString() === today.toDateString()) {
            dayDiv.classList.add('today');
        }

        // Check if it's selected
        if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
            dayDiv.classList.add('selected');
        }

        dayDiv.addEventListener('click', () => {
            selectDate(date);
        });

        datePickerDays.appendChild(dayDiv);
    }

    // Next month's days
    const totalCells = datePickerDays.children.length;
    const remainingCells = 42 - totalCells; // 6 weeks * 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'date-day other-month';
        dayDiv.textContent = day;
        datePickerDays.appendChild(dayDiv);
    }
}

function selectDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    dateInput.value = dateString;
    
    // Format display date in Indonesian
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('id-ID', options);
    dateDisplay.value = formattedDate;

    datePickerContainer.style.display = 'none';
    currentPickerDate = new Date(date);
}

function setDefaultDate() {
    const today = new Date();
    selectDate(today);
}

// Tambah Step Baru
document.getElementById('addStepBtn').addEventListener('click', () => {
    const num = stepsList.querySelectorAll('.step-item').length + 1;
    const div = document.createElement('div');
    div.className = 'step-item';
    div.innerHTML = `<span class="step-number">${num}</span><input type="text" class="step-input" placeholder="Langkah selanjutnya..." required>`;
    stepsList.appendChild(div);
});

// Kompresi Gambar
document.getElementById('imageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let w = img.width, h = img.height, max = 800;
            if (w > h) { if(w > max) { h *= max/w; w = max; } }
            else { if(h > max) { w *= max/h; h = max; } }
            
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);

            let q = 0.7;
            let result = canvas.toDataURL('image/jpeg', q);
            while (result.length > 102400 && q > 0.1) {
                q -= 0.1;
                result = canvas.toDataURL('image/jpeg', q);
            }
            compressedBase64 = result;
            document.getElementById('statusFoto').innerText = `✅ Tersimpan (${Math.round(result.length/1024)} KB)`;
            document.getElementById('statusFoto').style.color = "var(--primary-neon)";
        };
    };
});

// Simpan Data
repairForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.innerText = "⏳ Menyimpan..."; btn.disabled = true;

    const steps = Array.from(document.querySelectorAll('.step-input')).map(i => i.value);

    const { error } = await _supabase.from('repair_logs').insert([{
        date: dateInput.value,
        machine: document.getElementById('machineName').value,
        trouble: document.getElementById('trouble').value,
        parts: document.getElementById('partsChanged').value || "None",
        steps: steps,
        image_url: compressedBase64
    }]);

    if (error) {
        alert("Gagal: " + error.message);
    } else {
        repairForm.reset();
        setDefaultDate();
        compressedBase64 = null;
        document.getElementById('statusFoto').innerText = "Maksimal 100KB (Otomatis)";
        document.getElementById('statusFoto').style.color = "#8b949e";
        stepsList.innerHTML = `<div class="step-item"><span class="step-number">1</span><input type="text" class="step-input" required></div>`;
        fetchLogs();
    }
    btn.innerText = "SIMPAN DATA KE CLOUD"; btn.disabled = false;
});

// Ambil Data
async function fetchLogs() {
    logTableBody.innerHTML = '<tr><td colspan="4">Syncing...</td></tr>';
    const { data, error } = await _supabase.from('repair_logs').select('*').order('date', { ascending: false });
    if (error) return;
    logTableBody.innerHTML = '';
    data.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${log.date}</td><td><strong>${log.machine}</strong></td><td style="color:var(--accent-yellow)">${log.trouble}</td><td><button style="color:var(--primary-neon); backgr[...]
        row.onclick = () => showDetail(log);
        logTableBody.appendChild(row);
    });
}

function showDetail(log) {
    document.getElementById('modalTitle').innerText = `${log.machine} (${log.date})`;
    document.getElementById('modalTrouble').innerText = log.trouble;
    document.getElementById('modalParts').innerText = log.parts;
    document.getElementById('modalSteps').innerHTML = log.steps.map(s => `<li>${s}</li>`).join('');
    const img = document.getElementById('modalImgDisplay');
    if (log.image_url) { img.src = log.image_url; img.style.display = "block"; }
    else { img.style.display = "none"; }
    modal.style.display = "block";
}

document.querySelector('.close-btn').onclick = () => modal.style.display = "none";
window.onclick = (e) => { if(e.target == modal) modal.style.display = "none"; };

function searchLogs() {
    const q = document.getElementById('searchInput').value.toUpperCase();
    Array.from(logTableBody.rows).forEach(r => r.style.display = r.innerText.toUpperCase().includes(q) ? "" : "none");
}
