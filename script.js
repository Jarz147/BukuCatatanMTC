const SUPABASE_URL = 'https://neapdsjsqpcsxhxjwyik.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYXBkc2pzcXBjc3hoeGp3eWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0Nzg0NjgsImV4cCI6MjA5NDA1NDQ2OH0.0MK6HwbDBA9jTj-_ESGvs-ErCvcnQqlqAVGqEv_gG-w';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const repairForm = document.getElementById('repairForm');
const resultsContainer = document.getElementById('resultsContainer');
const fileInput = document.getElementById('fileInput');
const submitBtn = document.getElementById('submitBtn');

async function fetchLogs(keyword = '') {
    let query = supabaseClient.from('repair_logs').select('*').order('created_at', { ascending: false });
    if (keyword) {
        query = query.or(`machine_name.ilike.%${keyword}%,error_code.ilike.%${keyword}%,steps.ilike.%${keyword}%`);
    }
    const { data, error } = await query;
    if (!error) renderLogs(data);
}

function renderLogs(logs) {
    resultsContainer.innerHTML = '';
    logs.forEach(log => {
        const date = new Date(log.created_at).toLocaleString('id-ID');
        const card = document.createElement('div');
        card.className = 'log-card';
        
        let fileHTML = log.file_url ? `<a href="${log.file_url}" target="_blank" class="attachment-link">📄 Buka Lampiran (PDF/Gambar)</a>` : '';

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; font-weight:bold;">
                <span style="color:var(--accent-color)">${log.machine_name}</span>
                <span style="color:var(--neon-purple)">${log.error_code}</span>
            </div>
            <button class="detail-btn" onclick="toggleDetail(this)">LIHAT DETAIL</button>
            <div class="steps-container">
                <p style="white-space:pre-line; line-height:1.6;">${log.steps}</p>
                ${fileHTML}
                <div class="date-text">Waktu: ${date}</div>
            </div>
        `;
        resultsContainer.appendChild(card);
    });
}

function toggleDetail(btn) {
    const container = btn.nextElementSibling;
    container.classList.toggle('active');
    btn.innerText = container.classList.contains('active') ? 'TUTUP DETAIL' : 'LIHAT DETAIL';
}

repairForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerText = "SEDANG MENGIRIM...";

    const file = fileInput.files[0];
    let fileUrl = null;

    if (file) {
        // Cek ukuran file (Sekarang 500 KB)
        if (file.size > 500 * 1024) {
            alert("File terlalu besar! Maksimal 500KB agar PDF lancar.");
            submitBtn.disabled = false;
            submitBtn.innerText = "SIMPAN DATA";
            return;
        }

        const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
            .from('repair_files')
            .upload(fileName, file);

        if (!uploadError) {
            const { data: publicUrlData } = supabaseClient.storage
                .from('repair_files')
                .getPublicUrl(fileName);
            fileUrl = publicUrlData.publicUrl;
        } else {
            console.error("Upload error:", uploadError);
        }
    }

    const { error } = await supabaseClient.from('repair_logs').insert([{
        machine_name: document.getElementById('machineName').value,
        error_code: document.getElementById('errorCode').value,
        steps: document.getElementById('repairSteps').value,
        file_url: fileUrl
    }]);

    if (!error) {
        alert('Data dan File berhasil disimpan!');
        repairForm.reset();
        fetchLogs();
    } else {
        alert('Gagal simpan database: ' + error.message);
    }
    submitBtn.disabled = false;
    submitBtn.innerText = "SIMPAN DATA";
});

document.getElementById('searchBtn').onclick = () => fetchLogs(document.getElementById('searchInput').value);
fetchLogs();
