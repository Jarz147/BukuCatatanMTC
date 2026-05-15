// KONFIGURASI SUPABASE
const SUPABASE_URL = 'https://neapdsjsqpcsxhxjwyik.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYXBkc2pzcXBjc3hoeGp3eWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0Nzg0NjgsImV4cCI6MjA5NDA1NDQ2OH0.0MK6HwbDBA9jTj-_ESGvs-ErCvcnQqlqAVGqEv_gG-w';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const repairForm = document.getElementById('repairForm');
const resultsContainer = document.getElementById('resultsContainer');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Fungsi untuk mengambil data (Search/List All)
async function fetchLogs(keyword = '') {
    let query = supabaseClient
        .from('repair_logs')
        .select('*')
        .order('created_at', { ascending: false });

    if (keyword) {
        query = query.or(`machine_name.ilike.%${keyword}%,error_code.ilike.%${keyword}%,steps.ilike.%${keyword}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching logs:', error);
        return;
    }

    renderLogs(data);
}

// Fungsi untuk menampilkan data ke HTML
function renderLogs(logs) {
    resultsContainer.innerHTML = '';
    if (logs.length === 0) {
        resultsContainer.innerHTML = '<p style="color: grey; text-align: center;">Tidak ada data ditemukan.</p>';
        return;
    }

    logs.forEach(log => {
        const date = new Date(log.created_at).toLocaleString('id-ID');
        const card = document.createElement('div');
        card.className = 'log-card';
        card.innerHTML = `
            <div class="log-header">
                <span class="machine-tag">${log.machine_name}</span>
                <span class="error-tag">${log.error_code}</span>
            </div>
            <div class="steps-text">${log.steps}</div>
            <div class="date-text">Logged at: ${date}</div>
        `;
        resultsContainer.appendChild(card);
    });
}

// Event Listener untuk Submit Form
repairForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const machine_name = document.getElementById('machineName').value;
    const error_code = document.getElementById('errorCode').value;
    const steps = document.getElementById('repairSteps').value;

    const { data, error } = await supabaseClient
        .from('repair_logs')
        .insert([{ machine_name, error_code, steps }]);

    if (error) {
        alert('Gagal menyimpan data: ' + error.message);
    } else {
        alert('Data berhasil disimpan!');
        repairForm.reset();
        fetchLogs();
    }
});

// Event Listener untuk Pencarian
searchBtn.addEventListener('click', () => {
    fetchLogs(searchInput.value);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchLogs(searchInput.value);
    }
});

// Load data awal
fetchLogs();
