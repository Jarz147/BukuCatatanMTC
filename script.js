:root {
    --bg-dark: #0d1117;
    --card-bg: #161b22;
    --primary-neon: #00f2ff;
    --text-main: #c9d1d9;
    --border-color: #30363d;
    --accent-yellow: #ffeb3b;
    --danger: #f85149;
}

body {
    font-family: 'Segoe UI', sans-serif;
    background: var(--bg-dark);
    color: var(--text-main);
    padding: 20px;
    margin: 0;
}

.container { max-width: 900px; margin: auto; }

header {
    text-align: center; border-bottom: 2px solid var(--primary-neon);
    margin-bottom: 30px; padding-bottom: 15px;
}

header h1 { color: var(--primary-neon); letter-spacing: 1px; margin: 0; }

.form-section {
    background: var(--card-bg); padding: 20px;
    border-radius: 12px; border: 1px solid var(--border-color);
    margin-bottom: 30px;
}

.main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.full-width { grid-column: span 2; }

label { color: #8b949e; font-size: 0.85em; font-weight: bold; margin-bottom: 5px; display: block; }

input, .step-input {
    width: 100%; padding: 12px; background: #0d1117;
    border: 1px solid var(--border-color); color: white; border-radius: 6px;
    box-sizing: border-box; font-size: 14px;
}

input[type="date"] {
    cursor: pointer;
    color-scheme: dark;
}
input[type="date"]::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.85;
    filter: invert(1);
}
input[type="date"]::-webkit-datetime-edit-fields-wrapper {
    padding: 0;
}

input:focus { border-color: var(--primary-neon); outline: none; }

.step-item { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.step-number {
    background: var(--primary-neon); color: black; width: 24px; height: 24px;
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-weight: bold; font-size: 12px; flex-shrink: 0;
}

.btn-secondary {
    background: transparent; border: 1px dashed var(--primary-neon);
    color: var(--primary-neon); padding: 10px; cursor: pointer; width: 100%;
    border-radius: 6px;
}

.btn-submit {
    grid-column: span 2; background: var(--primary-neon); color: black;
    border: none; padding: 15px; font-weight: bold; cursor: pointer; 
    border-radius: 6px; font-size: 1em; margin-top: 10px;
}

.btn-submit:hover { filter: brightness(1.2); }

.table-wrapper { background: var(--card-bg); border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color); }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 15px; text-align: left; border-bottom: 1px solid var(--border-color); }
th { background: #21262d; color: var(--primary-neon); }
tr:hover { background: rgba(255,255,255,0.03); cursor: pointer; }

/* Modal & Image */
.modal { display: none; position: fixed; z-index: 100; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); backdrop-filter: blur(4px); }
.modal-content { background: var(--card-bg); margin: 5% auto; padding: 25px; width: 90%; max-width: 550px; border-radius: 15px; border: 1px solid var(--primary-neon); position: relative; }
.close-btn { position: absolute; right: 20px; top: 15px; font-size: 28px; cursor: pointer; color: #8b949e; }
.modal-image { width: 100%; max-height: 280px; object-fit: contain; margin-bottom: 20px; border-radius: 8px; background: #000; border: 1px solid var(--border-color); }
.divider { height: 1px; background: var(--border-color); margin: 15px 0; }
.highlight-yellow { color: var(--accent-yellow); font-weight: bold; }
.modal-step-list { padding-left: 20px; color: var(--text-main); }
