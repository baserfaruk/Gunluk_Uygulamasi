document.addEventListener('DOMContentLoaded', () => {
  const newEntryBtn = document.getElementById('new-entry-btn');
  const toggleThemeBtn = document.getElementById('toggle-theme-btn');
  const entryForm = document.getElementById('entry-form');
  const cancelEntryBtn = document.getElementById('cancel-entry-btn');
  const saveEntryBtn = document.getElementById('save-entry-btn');
  const entryTitleInput = document.getElementById('entry-title');
  const entryContentInput = document.getElementById('entry-content');
  const entryList = document.querySelector('.entry-list');

  // Gece modu geçişi
  toggleThemeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });

  // Yeni günlük formunu aç
  newEntryBtn.addEventListener('click', () => {
    entryForm.style.display = 'block';
  });

  // Günlük kaydetme
  saveEntryBtn.addEventListener('click', async () => {
    const title = entryTitleInput.value.trim();
    const content = entryContentInput.value.trim();
    const date = new Date().toLocaleString();

    if (title && content) {
      try {
        await window.__TAURI__.core.invoke('save_entry', { title, content, date });
        alert('Günlük başarıyla kaydedildi!');
        loadEntries(); // Günlükleri tekrar yükle
      } catch (error) {
        alert('Hata: ' + error);
      }
      
      entryTitleInput.value = '';
      entryContentInput.value = '';
      entryForm.style.display = 'none';
    } else {
      alert('Lütfen başlık ve içerik girin!');
    }
  });

  // Formu iptal etme
  cancelEntryBtn.addEventListener('click', () => {
    entryTitleInput.value = '';
    entryContentInput.value = '';
    entryForm.style.display = 'none';
  });

  // Günlükleri yükleme
  async function loadEntries() {
    try {
      const entries = await window.__TAURI__.core.invoke('get_entries');
      entryList.innerHTML = '';
      entries.forEach(entry => {
        const entryElement = document.createElement('div');
        entryElement.classList.add('entry');
        entryElement.innerHTML = `
          <div class="entry-title">${entry.title}</div>
          <div class="entry-content">${entry.content}</div>
          <div class="entry-date">${entry.date}</div>
        `;
        entryList.appendChild(entryElement);
      });
    } catch (error) {
      alert('Günlükler yüklenirken hata oluştu: ' + error);
    }
  }

  loadEntries(); // Başlangıçta günlükleri yükle
});
