const repairForm = document.getElementById('repairForm');
const stepsList = document.getElementById('stepsList');
const logTableBody = document.getElementById('logTableBody');
const modal = document.getElementById('detailModal');
const closeBtn = document.querySelector('.close-btn');

document.addEventListener('DOMContentLoaded', displayLogs);

// Tambah Input Step
document.getElementById('addStepBtn').addEventListener('click', () => {
    const currentSteps = stepsList.querySelectorAll('.step-item').length;
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step-item';
    stepDiv.innerHTML = `
        <span class="step-number">${currentSteps + 1}</span>
        <input type="text" class="step-input" required>
    `;
    stepsList.appendChild(stepDiv);
});

// Simpan Data
repairForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const stepInputs = document.querySelectorAll('.step-input');
    
    const newEntry = {
        id: Date.now(),
        date: document.getElementById('repairDate').value,
        machine: document.getElementById('machineName').value,
        trouble: document.getElementById('trouble').value,
        parts: document.getElementById('partsChanged').value || "Tidak ada part yang diganti",
        steps: Array.from(stepInputs).map(input => input.value)
    };

    let logs = JSON.parse(localStorage.getItem('machineLogs')) || [];
    logs.push(newEntry);
    localStorage.setItem('machineLogs', JSON.stringify(logs));

    repairForm.reset();
    stepsList.innerHTML = `<div class="step-item"><span class="step-number">1</span><input type="text" class="step-input" required></div>`;
    displayLogs();
});

// Tampilkan Tabel
function displayLogs() {
    let logs = JSON.parse(localStorage.getItem('machineLogs')) || [];
    logTableBody.innerHTML = '';
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));

    logs.forEach(log => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${log.date}</td>
            <td><strong>${log.machine}</strong></td>
            <td class="highlight-trouble">${log.trouble}</td>
            <td><button class="btn-view">Lihat Detail</button></td>
        `;
        // Klik Baris untuk buka Modal
        row.onclick = () => showDetail(log);
        logTableBody.appendChild(row);
    });
}

// Fungsi Tampilkan Modal
function showDetail(log) {
    document.getElementById('modalTitle').innerText = `Histori: ${log.machine} (${log.date})`;
    document.getElementById('modalTrouble').innerText = log.trouble;
    document.getElementById('modalParts').innerText = log.parts;
    
    const modalSteps = document.getElementById('modalSteps');
    modalSteps.innerHTML = log.steps.map(s => `<li>${s}</li>`).join('');
    
    modal.style.display = "block";
}

// Tutup Modal
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; };

// Search
function searchLogs() {
    let filter = document.getElementById('searchInput').value.toUpperCase();
    let rows = logTableBody.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {
        if (rows[i].textContent.toUpperCase().includes(filter)) rows[i].style.display = "";
        else rows[i].style.display = "none";
    }
}
