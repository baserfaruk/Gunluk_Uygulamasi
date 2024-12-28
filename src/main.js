document.addEventListener('DOMContentLoaded', () => {
  const newEntryBtn = document.getElementById('new-entry-btn');
  const toggleThemeBtn = document.getElementById('toggle-theme-btn');
  const entryForm = document.getElementById('entry-form');
  const cancelEntryBtn = document.getElementById('cancel-entry-btn');
  const saveEntryBtn = document.getElementById('save-entry-btn');
  const entryTitleInput = document.getElementById('entry-title');
  const entryContentInput = document.getElementById('entry-content');
  const entryList = document.querySelector('.entry-list');
  let editIndex = null;

  // Gece modu geçişi
  toggleThemeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });

  // Yeni günlük formunu aç
  newEntryBtn.addEventListener('click', () => {
    entryForm.style.display = 'block';
    editIndex = null;
  });

  // Günlük kaydetme
  saveEntryBtn.addEventListener('click', async () => {
    const title = entryTitleInput.value.trim();
    const content = entryContentInput.value.trim();
    const date = new Date().toLocaleString();

    if (title && content) {
      try {
        if (editIndex === null) {
          await window.__TAURI__.core.invoke('save_entry', { title, content, date });
          alert('Günlük başarıyla kaydedildi!');
        } else {
          await window.__TAURI__.core.invoke('edit_entry', { index: editIndex, title, content, date });
          alert('Günlük başarıyla güncellendi!');
        }
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
      entries.forEach((entry, index) => {
        const entryElement = document.createElement('div');
        entryElement.classList.add('entry');
        entryElement.innerHTML = `
          <div class="entry-title">${entry.title}</div>
          <div class="entry-content">${entry.content}</div>
          <div class="entry-date">${entry.date}</div>
          <button class="edit-entry-btn">Düzenle</button>
          <button class="delete-entry-btn">Sil</button>
        `;
        entryList.appendChild(entryElement);

        // Düzenleme butonuna tıklama
        entryElement.querySelector('.edit-entry-btn').addEventListener('click', () => {
          entryTitleInput.value = entry.title;
          entryContentInput.value = entry.content;
          entryForm.style.display = 'block';
          editIndex = index;
        });

        // Silme butonuna tıklama
        entryElement.querySelector('.delete-entry-btn').addEventListener('click', async () => {
          try {
            await window.__TAURI__.core.invoke('delete_entry', { index });
            alert('Günlük başarıyla silindi!');
            loadEntries(); // Günlükleri tekrar yükle
          } catch (error) {
            alert('Hata: ' + error);
          }
        });
      });
    } catch (error) {
      alert('Günlükler yüklenirken hata oluştu: ' + error);
    }
  }

  loadEntries(); // Başlangıçta günlükleri yükle
});