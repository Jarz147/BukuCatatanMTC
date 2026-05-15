const SUPABASE_URL = 'https://neapdsjsqpcsxhxjwyik.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYXBkc2pzcXBjc3hoeGp3eWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0Nzg0NjgsImV4cCI6MjA5NDA1NDQ2OH0.0MK6HwbDBA9jTj-_ESGvs-ErCvcnQqlqAVGqEv_gG-w';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const repairForm = document.getElementById('repairForm');
const fileInput = document.getElementById('fileInput');
const submitBtn = document.getElementById('submitBtn');
const statusCompress = document.getElementById('statusCompress');

async function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const max_size = 1000;
                if (width > height && width > max_size) { height *= max_size / width; width = max_size; }
                else if (height > max_size) { width *= max_size / height; height = max_size; }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.6);
            };
        };
    });
}

async function fetchLogs(keyword = '') {
    let query = supabaseClient.from('repair_logs').select('*').order('created_at', { ascending: false });
    if (keyword) query = query.or(`machine_name.ilike.%${keyword}%,error_code.ilike.%${keyword}%,steps.ilike.%${keyword}%`);
    const { data } = await query;
    if (data) renderLogs(data);
}

function renderLogs(logs) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';
    logs.forEach(log => {
        const card = document.createElement('div');
        card.className = 'log-card';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between;">
                <b style="color:var(--accent-color)">${log.machine_name}</b>
                <span style="color:var(--neon-purple)">${log.error_code}</span>
            </div>
            <button class="detail-btn" onclick="this.nextElementSibling.classList.toggle('active')">LIHAT DETAIL</button>
            <div class="steps-container">
                <p style="white-space:pre-line">${log.steps}</p>
                ${log.file_url ? `<a href="${log.file_url}" target="_blank" class="attachment-link">📎 Buka Lampiran</a>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

repairForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerText = "MEMPROSES...";
    let file = fileInput.files[0];
    let fileUrl = null;

    try {
        if (file) {
            if (file.type.startsWith('image/')) {
                statusCompress.innerText = "Mengompres gambar...";
                file = await compressImage(file);
            }
            if (file.size > 105 * 1024) {
                alert("File masih di atas 100KB. Gunakan file lebih kecil.");
                throw new Error("Limit");
            }
            const fileName = `${Date.now()}_file`;
            const { data: uploadData, error: upErr } = await supabaseClient.storage.from('repair_files').upload(fileName, file);
            if (upErr) throw upErr;
            const { data } = supabaseClient.storage.from('repair_files').getPublicUrl(fileName);
            fileUrl = data.publicUrl;
        }

        const { error: insErr } = await supabaseClient.from('repair_logs').insert([{
            machine_name: document.getElementById('machineName').value,
            error_code: document.getElementById('errorCode').value,
            steps: document.getElementById('repairSteps').value,
            file_url: fileUrl
        }]);
        if (insErr) throw insErr;
        alert("Berhasil!"); repairForm.reset(); statusCompress.innerText = ""; fetchLogs();
    } catch (err) {
        alert("Gagal: " + err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "SIMPAN KE DATABASE";
    }
});

document.getElementById('searchBtn').onclick = () => fetchLogs(document.getElementById('searchInput').value);
fetchLogs();
