const repairForm = document.getElementById('repairForm');
const logTableBody = document.getElementById('logTableBody');

// Load data saat aplikasi dibuka
document.addEventListener('DOMContentLoaded', displayLogs);

// Event listener untuk simpan data
repairForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const newLog = {
        id: Date.now(),
        date: document.getElementById('repairDate').value,
        machine: document.getElementById('machineName').value,
        trouble: document.getElementById('trouble').value,
        action: document.getElementById('action').value
    };

    // Ambil data lama, tambah data baru, simpan kembali
    let logs = JSON.parse(localStorage.getItem('machineLogs')) || [];
    logs.push(newLog);
    localStorage.setItem('machineLogs', JSON.stringify(logs));

    // Reset form dan refresh tabel
    repairForm.reset();
    displayLogs();
});

// Fungsi untuk menampilkan data ke tabel
function displayLogs() {
    let logs = JSON.parse(localStorage.getItem('machineLogs')) || [];
    logTableBody.innerHTML = '';

    // Sortir data berdasarkan tanggal (terbaru di atas)
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));

    logs.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${log.date}</td>
            <td><strong>${log.machine}</strong></td>
            <td class="highlight">${log.trouble}</td>
            <td>${log.action}</td>
        `;
        logTableBody.appendChild(row);
    });
}

// Fungsi pencarian/filter
function searchLogs() {
    let filter = document.getElementById('searchInput').value.toUpperCase();
    let rows = logTableBody.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        let content = rows[i].textContent || rows[i].innerText;
        if (content.toUpperCase().indexOf(filter) > -1) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}
