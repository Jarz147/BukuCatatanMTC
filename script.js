// Konfigurasi Supabase Anda
const SUPABASE_URL = 'https://neapdsjsqpcsxhxjwyik.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYXBkc2pzcXBjc3hoeGp3eWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0Nzg0NjgsImV4cCI6MjA5NDA1NDQ2OH0.0MK6HwbDBA9jTj-_ESGvs-ErCvcnQqlqAVGqEv_gG-w';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const repairForm = document.getElementById('repairForm');
const stepsList = document.getElementById('stepsList');
const addStepBtn = document.getElementById('addStepBtn');
const logTableBody = document.getElementById('logTableBody');
const modal = document.getElementById('detailModal');
const closeBtn = document.querySelector('.close-btn');

document.addEventListener('DOMContentLoaded', fetchLogs);

// Tambah Input Baris Langkah
addStepBtn.addEventListener('click', () => {
    const stepCount = stepsList.querySelectorAll('.step-item').length + 1;
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step-item';
    stepDiv.innerHTML = `
        <span class="step-number">${stepCount}</span>
        <input type="text" class="step-input" placeholder="Langkah selanjutnya..." required>
    `;
    stepsList.appendChild(stepDiv);
});

// Simpan ke Supabase
repairForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.innerText = "⏳ Sedang Menyimpan...";
    btn.disabled = true;

    const stepInputs = document.querySelectorAll('.step-input');
    const stepsArray = Array.from(stepInputs).map(input => input.value);

    const { error } = await _supabase
        .from('repair_logs')
        .insert([{
            date: document.getElementById('repairDate').value,
            machine: document.getElementById('machineName').value,
            trouble: document.getElementById('trouble').value,
            parts: document.getElementById('partsChanged').value || "Tidak ada part yang diganti",
            steps: stepsArray
        }]);

    if (error) {
        alert("Error: " + error.message);
    } else {
        repairForm.reset();
        stepsList.innerHTML = `<div class="step-item"><span class="step-number">1</span><input type="text" class="step-input" required></div>`;
        await fetchLogs();
    }
    btn.innerText = "SIMPAN DATA KE CLOUD";
    btn.disabled = false;
});

// Ambil Data dari Cloud
async function fetchLogs() {
    logTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center">Syncing with Cloud...</td></tr>';
    
    const { data, error } = await _supabase
        .from('repair_logs')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        logTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red">Gagal memuat data.</td></tr>';
        return;
    }

    logTableBody.innerHTML = '';
    data.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${log.date}</td>
            <td><strong>${log.machine}</strong></td>
            <td style="color:var(--accent-yellow)">${log.trouble}</td>
            <td><button class="btn-view" style="background:transparent; border:1px solid var(--primary-neon); color:var(--primary-neon); cursor:pointer; border-radius:4px; padding:4px 8px;">Detail</button></td>
        `;
        row.onclick = () => showDetail(log);
        logTableBody.appendChild(row);
    });
}

// Modal Logic
function showDetail(log) {
    document.getElementById('modalTitle').innerText = `${log.machine} - ${log.date}`;
    document.getElementById('modalTrouble').innerText = log.trouble;
    document.getElementById('modalParts').innerText = log.parts;
    
    const stepsOl = document.getElementById('modalSteps');
    stepsOl.innerHTML = log.steps.map(s => `<li>${s}</li>`).join('');
    
    modal.style.display = "block";
}

closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if(e.target == modal) modal.style.display = "none" };

// Search Filter
function searchLogs() {
    const q = document.getElementById('searchInput').value.toUpperCase();
    const rows = logTableBody.getElementsByTagName('tr');
    for (let r of rows) {
        r.style.display = r.innerText.toUpperCase().includes(q) ? "" : "none";
    }
}
