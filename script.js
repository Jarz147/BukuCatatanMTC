const URL = 'https://neapdsjsqpcsxhxjwyik.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYXBkc2pzcXBjc3hoeGp3eWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0Nzg0NjgsImV4cCI6MjA5NDA1NDQ2OH0.0MK6HwbDBA9jTj-_ESGvs-ErCvcnQqlqAVGqEv_gG-w';
const _supabase = supabase.createClient(URL, KEY);

const repairForm = document.getElementById('repairForm');
const stepsList = document.getElementById('stepsList');
const logTableBody = document.getElementById('logTableBody');
const modal = document.getElementById('detailModal');
let compressedBase64 = null;

document.addEventListener('DOMContentLoaded', () => {
    setDefaultDate();
    fetchLogs();
});

function setDefaultDate() {
    document.getElementById('repairDate').value = new Date().toISOString().split('T')[0];
}

// Tambah Step Input
document.getElementById('addStepBtn').addEventListener('click', () => {
    const num = stepsList.querySelectorAll('.step-item').length + 1;
    const div = document.createElement('div');
    div.className = 'step-item';
    div.innerHTML = `<span class="step-number">${num}</span><input type="text" class="step-input" required>`;
    stepsList.appendChild(div);
});

// Logic Kompresi Gambar
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
            let w = img.width, h = img.height;
            const max = 800;
            if (w > h) { if(w > max) { h *= max/w; w = max; } }
            else { if(h > max) { w *= max/h; h = max; } }
            
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);

            let qual = 0.7;
            let result = canvas.toDataURL('image/jpeg', qual);
            while (result.length > 102400 && qual > 0.1) {
                qual -= 0.1;
                result = canvas.toDataURL('image/jpeg', qual);
            }
            compressedBase64 = result;
            document.getElementById('statusFoto').innerText = `Siap! (${Math.round(result.length/1024)} KB)`;
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
        date: document.getElementById('repairDate').value,
        machine: document.getElementById('machineName').value,
        trouble: document.getElementById('trouble').value,
        parts: document.getElementById('partsChanged').value || "None",
        steps: steps,
        image_url: compressedBase64
    }]);

    if (error) alert("Gagal: " + error.message);
    else {
        repairForm.reset();
        setDefaultDate();
        compressedBase64 = null;
        document.getElementById('statusFoto').innerText = "Maksimal 100KB (Otomatis)";
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
        row.innerHTML = `<td>${log.date}</td><td><strong>${log.machine}</strong></td><td style="color:var(--accent-yellow)">${log.trouble}</td><td><button style="color:var(--primary-neon); background:none; border:1px solid; cursor:pointer; border-radius:4px">Detail</button></td>`;
        row.onclick = () => showDetail(log);
        logTableBody.appendChild(row);
    });
}

function showDetail(log) {
    document.getElementById('modalTitle').innerText = log.machine;
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
