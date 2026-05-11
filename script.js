const URL = 'https://neapdsjsqpcsxhxjwyik.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYXBkc2pzcXBjc3hoeGp3eWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0Nzg0NjgsImV4cCI6MjA5NDA1NDQ2OH0.0MK6HwbDBA9jTj-_ESGvs-ErCvcnQqlqAVGqEv_gG-w';
const _supabase = supabase.createClient(URL, KEY);

/** Nama bucket di Supabase Storage (samakan dengan yang dibuat di Dashboard → Storage). */
const STORAGE_BUCKET = 'repair-photos';

const repairForm = document.getElementById('repairForm');
const stepsList = document.getElementById('stepsList');
const logTableBody = document.getElementById('logTableBody');
const modal = document.getElementById('detailModal');
const dateInput = document.getElementById('repairDate');
let compressedBase64 = null;

document.addEventListener('DOMContentLoaded', () => {
    setDefaultDate();
    fetchLogs();
});

function setDefaultDate() {
    const today = new Date();
    dateInput.value = today.toISOString().split('T')[0];
}

function dataURLToBlob(dataUrl) {
    const [, base64] = dataUrl.split(',');
    const mime = dataUrl.slice(5, dataUrl.indexOf(';')) || 'image/jpeg';
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime });
}

/** Unggah gambar terkompresi ke bucket; kembalikan URL publik atau null jika gagal / tidak ada foto. */
async function uploadRepairImage(dataUrl) {
    if (!dataUrl || !dataUrl.startsWith('data:')) return null;
    const ext = dataUrl.includes('image/png') ? 'png' : 'jpg';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const blob = dataURLToBlob(dataUrl);

    const { error } = await _supabase.storage.from(STORAGE_BUCKET).upload(path, blob, {
        contentType: blob.type || 'image/jpeg',
        upsert: false,
    });
    if (error) throw error;

    const { data } = _supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
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

    try {
        const steps = Array.from(document.querySelectorAll('.step-input')).map(i => i.value);

        let imageUrl = null;
        if (compressedBase64) imageUrl = await uploadRepairImage(compressedBase64);

        const { error } = await _supabase.from('repair_logs').insert([{
            date: dateInput.value,
            machine: document.getElementById('machineName').value,
            trouble: document.getElementById('trouble').value,
            parts: document.getElementById('partsChanged').value || "None",
            steps: steps,
            image_url: imageUrl,
        }]);

        if (error) {
            alert("Gagal simpan ke tabel repair_logs: " + error.message);
            return;
        }

        alert("Data berhasil disimpan ke Supabase.");
        repairForm.reset();
        setDefaultDate();
        compressedBase64 = null;
        document.getElementById('statusFoto').innerText = "Maksimal 100KB (Otomatis)";
        stepsList.innerHTML = `<div class="step-item"><span class="step-number">1</span><input type="text" class="step-input" required></div>`;
        await fetchLogs();
    } catch (err) {
        alert("Gagal proses simpan: " + (err.message || String(err)));
        console.error("submit repairForm error:", err);
    } finally {
        btn.innerText = "SIMPAN DATA KE CLOUD";
        btn.disabled = false;
    }
});

// Ambil Data
async function fetchLogs() {
    logTableBody.innerHTML = '<tr><td colspan="4">Syncing...</td></tr>';
    const { data, error } = await _supabase.from('repair_logs').select('*').order('date', { ascending: false });
    if (error) {
        logTableBody.innerHTML = `<tr><td colspan="4">Gagal ambil data: ${error.message}</td></tr>`;
        console.error("fetchLogs error:", error);
        return;
    }
    logTableBody.innerHTML = '';
    data.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${log.date}</td><td><strong>${log.machine}</strong></td><td style="color:var(--accent-yellow)">${log.trouble}</td><td><button style="color:var(--primary-neon); background:none; border:1px solid; border-radius:4px; padding:4px 8px; cursor:pointer">Detail</button></td>`;
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
    /* URL bucket (https...) atau data lama base64 (data:image/...) */
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
