// Konfigurasi Supabase Pajar Ardianto
const URL = 'https://neapdsjsqpcsxhxjwyik.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYXBkc2pzcXBjc3hoeGp3eWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0Nzg0NjgsImV4cCI6MjA5NDA1NDQ2OH0.0MK6HwbDBA9jTj-_ESGvs-ErCvcnQqlqAVGqEv_gG-w';
const _supabase = supabase.createClient(URL, KEY);

const repairForm = document.getElementById('repairForm');
const stepsList = document.getElementById('stepsList');
const logTableBody = document.getElementById('logTableBody');
const modal = document.getElementById('detailModal');
const dateInput = document.getElementById('repairDate');
let compressedBase64 = null;

document.addEventListener('DOMContentLoaded', () => {
    setDefaultDate();
    fetchLogs();
    
    // Memastikan Date Picker muncul saat input diklik
    dateInput.addEventListener('click', function() {
        try { this.showPicker(); } catch (e) { console.log("Manual picker not supported"); }
    });
});

// Set Tanggal Hari Ini secara otomatis
function setDefaultDate() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    dateInput.value = formattedDate;
}

// Tambah Baris Langkah Baru
document.getElementById('addStepBtn').addEventListener('click', () => {
    const num = stepsList.querySelectorAll('.step-item').length + 1;
    const div = document.createElement('div');
    div.className = 'step-item';
    div.innerHTML = `<span class="step-number">${num}</span><input type="text" class="step-input" placeholder="Langkah selanjutnya..." required>`;
    stepsList.appendChild(div);
});

// Logika Kompresi Gambar Kamera
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
            const maxDimension = 800; // Maksimal resolusi 800px
            
            if (w > h) { if(w > maxDimension) { h *= maxDimension/w; w = maxDimension; } }
            else { if(h > maxDimension) { w *= maxDimension/h; h = maxDimension; } }
            
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);

            let quality = 0.7;
            let result = canvas.toDataURL('image/jpeg', quality);
            
            // Loop kompresi sampai di bawah 100KB (102400 bytes)
            while (result.length > 102400 && quality > 0.1) {
                quality -= 0.1;
                result = canvas.toDataURL('image/jpeg', quality);
            }
            
            compressedBase64 = result;
            const status = document.getElementById('statusFoto');
            status.innerText = `✅ Terkompresi: ${Math.round(result.length/1024)} KB`;
            status.style.color = "var(--primary-neon)";
        };
    };
});

// Simpan Data ke Supabase
repairForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.innerText = "⏳ Menyimpan ke Cloud..."; btn.disabled = true;

    const steps = Array.from(document.querySelectorAll('.step-input')).map(i => i.value);

    const { error } = await _supabase.from('repair_logs').insert([{
        date: dateInput.value,
        machine: document.getElementById('machineName').value,
        trouble: document.getElementById('trouble').value,
        parts: document.getElementById('partsChanged').value || "Tidak ada part yang diganti",
        steps: steps,
        image_url: compressedBase64
    }]);

    if (error) {
        alert("Gagal menyimpan: " + error.message);
    } else {
        repairForm.reset();
        setDefaultDate();
        compressedBase64 = null;
        document.getElementById('statusFoto').innerText = "Maksimal 100KB (Otomatis)";
        document.getElementById('statusFoto').style.color = "#8b949e";
        stepsList.innerHTML = `<div class="step-item"><span class="step-number">1</span><input type="text" class="step-input" placeholder="Langkah 1..." required></div>`;
        fetchLogs();
    }
    btn.innerText = "SIMPAN DATA KE CLOUD"; btn.disabled = false;
});

// Ambil Data dari Cloud
async function fetchLogs() {
    logTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center">Sinkronisasi Cloud...</td></tr>';
    const { data, error } = await _supabase.from('repair_logs').select('*').order('date', { ascending: false });
    
    if (error) {
        logTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red">Gagal Sync data.</td></tr>';
        return;
    }

    logTableBody.innerHTML = '';
    data.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${log.date}</td>
            <td><strong>${log.machine}</strong></td>
            <td style="color:var(--accent-yellow)">${log.trouble}</td>
            <td><button style="color:var(--primary-neon); background:none; border:1px solid; border-radius:4px; padding:4px 8px; cursor:pointer">Detail</button></td>
        `;
        row.onclick = () => showDetail(log);
        logTableBody.appendChild(row);
    });
}

// Fungsi Tampilkan Modal Detail
function showDetail(log) {
    document.getElementById('modalTitle').innerText = `${log.machine} (${log.date})`;
    document.getElementById('modalTrouble').innerText = log.trouble;
    document.getElementById('modalParts').innerText = log.parts;
    document.getElementById('modalSteps').innerHTML = log.steps.map(s => `<li>${s}</li>`).join('');
    
    const img = document.getElementById('modalImgDisplay');
    if (log.image_url) {
        img.src = log.image_url;
        img.style.display = "block";
    } else {
        img.style.display = "none";
    }
    
    modal.style.display = "block";
}

// Penutup Modal
document.querySelector('.close-btn').onclick = () => modal.style.display = "none";
window.onclick = (e) => { if(e.target == modal) modal.style.display = "none"; };

// Filter Pencarian
function searchLogs() {
    const q = document.getElementById('searchInput').value.toUpperCase();
    const rows = logTableBody.getElementsByTagName('tr');
    for (let r of rows) {
        r.style.display = r.innerText.toUpperCase().includes(q) ? "" : "none";
    }
}
