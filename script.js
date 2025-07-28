window.downloadDiaryFile = function() {
  var result = document.getElementById("result").value;
  var keyword = document.getElementById("keyword").value;
  if (!result) {
    alert("No result to save!");
    return;
  }
  if (!keyword) {
    alert("Please enter a keyword!");
    return;
  }
  var contentToSave = `${result}\n\n'${keyword}'`;

  // Lấy ngày từ selectedDate nếu có, nếu không thì lấy ngày hiện tại
  var now;
  if (window.selectedDate) {
    var parts = window.selectedDate.split("-");
    now = new Date(parts[0], parts[1] - 1, parts[2]);
  } else {
    now = new Date();
  }
  var day = now.getDate();
  var month = now.getMonth() + 1;
  var year = now.getFullYear();
  var daysOfWeek = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  var vietnameseDay = daysOfWeek[now.getDay()];
  var fileName = `${vietnameseDay} ngày ${day} tháng ${month} năm ${year}.txt`;

  var blob = new Blob([contentToSave], { type: "text/plain" });
  var link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
function encryptText() {
    var text = document.getElementById("text").value;
    var keyword = document.getElementById("keyword").value;
    if (/[A-Z]/.test(keyword) || /[^a-zA-Z0-9]/.test(keyword)) {
      alert("Warning: Keyword contains uppercase letter(s) or special character(s).");
    }
    var encrypted = encryptWithKeywordCipher(text, keyword);
    document.getElementById("result").value = encrypted;
    autoResizeTextarea();
  }
  
  function decryptText() {
    var encrypted = document.getElementById("text").value;
    var keyword = document.getElementById("keyword").value;
    var decrypted = decryptWithKeywordCipher(encrypted, keyword);
    document.getElementById("result").value = decrypted;
    autoResizeTextarea();
  }
  

// Popup logic for Save/Read Diary
let diaryMode = null; // 'read' or 'save'
let selectedFolder = null;
let selectedFile = null;

window.openReadPopup = function() {
  diaryMode = 'read';
  selectedFolder = null;
  selectedFile = null;
  document.getElementById('saveFileDiv').style.display = 'none';
  document.getElementById('diaryModalLabel').innerText = 'Đọc nhật ký';
  showDiaryModal();
}

window.openSavePopup = function() {
  diaryMode = 'save';
  selectedFolder = null;
  selectedFile = null;
  document.getElementById('saveFileDiv').style.display = 'block';
  document.getElementById('diaryModalLabel').innerText = 'Lưu nhật ký';
  // Gợi ý tên file theo ngày/tháng/năm
  document.getElementById('saveFileName').value = suggestDiaryFileName();
  showDiaryModal();
}

function showDiaryModal() {
  loadFolderList();
  document.getElementById('fileList').innerHTML = '';
  var modal = new bootstrap.Modal(document.getElementById('diaryModal'));
  modal.show();
}

async function loadFolderList() {
  // Lấy danh sách folder động từ server
  try {
    const res = await fetch('/api/list-folders');
    const data = await res.json();
    let folders = data.folders || [];
    // Đảm bảo luôn có folder Special nếu chưa có
    if (!folders.includes('Special')) folders.push('Special');
    // Sắp xếp: năm tăng dần, Special cuối cùng
    folders = folders.filter(f => f !== 'Special').sort((a, b) => a.localeCompare(b, 'vi', {numeric:true}))
      .concat(['Special']);
    const folderList = document.getElementById('folderList');
    folderList.innerHTML = '';
    folders.forEach(f => {
      const li = document.createElement('li');
      li.className = 'list-group-item list-group-item-action';
      li.innerText = f;
      li.onclick = () => window.selectFolder(f);
      folderList.appendChild(li);
    });
  } catch (err) {
    const folderList = document.getElementById('folderList');
    folderList.innerHTML = '<li class="list-group-item text-danger">Lỗi khi tải folder</li>';
  }
}

window.showCreateFolderInput = function() {
  document.getElementById('createFolderDiv').style.display = 'block';
  document.getElementById('newFolderName').focus();
}

window.createNewFolder = function() {
  const name = document.getElementById('newFolderName').value.trim();
  if (!name) return;
  // Gọi API tạo folder thật trên server
  fetch('/api/create-folder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder: name })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert('Lỗi khi tạo thư mục: ' + data.error);
        return;
      }
      // Sau khi tạo thành công, thêm vào danh sách client
      const folderList = document.getElementById('folderList');
      const li = document.createElement('li');
      li.className = 'list-group-item list-group-item-action';
      li.innerText = name;
      li.onclick = () => window.selectFolder(name);
      folderList.appendChild(li);
      document.getElementById('createFolderDiv').style.display = 'none';
      document.getElementById('newFolderName').value = '';
    })
    .catch(() => {
      alert('Lỗi khi kết nối server!');
    });
}

window.selectFolder = async function(folder) {
  selectedFolder = folder;
  // Gợi ý tên file khi chọn folder (chỉ khi đang ở chế độ lưu)
  if (diaryMode === 'save') {
    document.getElementById('saveFileName').value = suggestDiaryFileName();
  }
  // Lấy danh sách file trong folder
  let url = '';
  if (folder === 'Special') url = '/api/list-diaries?year=Special';
  else url = '/api/list-diaries?year=' + folder;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    if (data.files && data.files.length) {
      data.files.forEach(f => {
        const li = document.createElement('li');
        li.className = 'list-group-item list-group-item-action';
        li.innerText = f;
        li.onclick = () => window.selectFile(f);
        fileList.appendChild(li);
      });
    } else {
      fileList.innerHTML = '<li class="list-group-item text-muted">Không có file nào</li>';
    }
  } catch (err) {
    document.getElementById('fileList').innerHTML = '<li class="list-group-item text-danger">Lỗi khi tải file</li>';
  }
}
// Hàm gợi ý tên file nhật ký theo ngày/tháng/năm
function suggestDiaryFileName() {
  var now;
  if (window.selectedDate) {
    var parts = window.selectedDate.split("-");
    now = new Date(parts[0], parts[1] - 1, parts[2]);
  } else {
    now = new Date();
  }
  var day = now.getDate();
  var month = now.getMonth() + 1;
  var year = now.getFullYear();
  var daysOfWeek = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  var vietnameseDay = daysOfWeek[now.getDay()];
  return `${vietnameseDay} ngày ${day} tháng ${month} năm ${year}.txt`;
}

window.selectFile = function(file) {
  selectedFile = file;
  if (diaryMode === 'read') confirmReadFile();
  if (diaryMode === 'save') document.getElementById('saveFileName').value = file;
}

window.refreshFileList = function() {
  if (selectedFolder) window.selectFolder(selectedFolder);
}

async function confirmReadFile() {
  if (!selectedFolder || !selectedFile) return;
  // Đọc nội dung file
  try {
    const res = await fetch(`/api/read-diary?filename=${encodeURIComponent(selectedFile)}&year=${encodeURIComponent(selectedFolder)}`);
    const data = await res.json();
    if (!res.ok) {
      alert('Lỗi khi đọc nhật ký: ' + (data.error || 'Unknown error'));
      return;
    }
    const [result, keyword] = data.content.split("\n\n'");
    document.getElementById("text").value = result || "";
    document.getElementById("keyword").value = keyword ? keyword.replace("'", "") : "";
    autoResizeTextarea();
    bootstrap.Modal.getInstance(document.getElementById('diaryModal')).hide();
  } catch (err) {
    alert('Lỗi khi kết nối server!');
  }
}

window.confirmSaveFile = async function() {
  const fileName = document.getElementById('saveFileName').value.trim();
  if (!selectedFolder || !fileName) {
    alert('Chọn thư mục và nhập tên file!');
    return;
  }
  // Lưu nhật ký
  var result = document.getElementById("result").value;
  var keyword = document.getElementById("keyword").value;
  if (!result) {
    alert("No result to save!");
    return;
  }
  if (!keyword) {
    alert("Please enter a keyword!");
    return;
  }
  var contentToSave = `${result}\n\n'${keyword}'`;
  try {
    const res = await fetch('/api/save-diary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: fileName, content: contentToSave, year: selectedFolder })
    });
    const data = await res.json();
    if (res.ok) {
      alert('Đã lưu nhật ký lên server!');
      bootstrap.Modal.getInstance(document.getElementById('diaryModal')).hide();
    } else {
      alert('Lỗi khi lưu nhật ký: ' + (data.error || 'Unknown error'));
    }
  } catch (err) {
    alert('Lỗi khi kết nối server!');
  }
}
  
  function encryptWithKeywordCipher(text, keyword) {
    var alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
    var cipher = "";
    var key = "";
  
    for (var i = 0; i < keyword.length; i++) {
      if (key.indexOf(keyword.charAt(i)) == -1) {
        key += keyword.charAt(i);
      }
    }
  
    for (var i = 0; i < key.length; i++) {
      if (cipher.indexOf(key.charAt(i)) == -1) {
        cipher += key.charAt(i);
      }
    }
  
    for (var i = 0; i < alphabet.length; i++) {
      if (cipher.indexOf(alphabet.charAt(i)) == -1) {
        cipher += alphabet.charAt(i);
      }
    }
  
    var encrypted = "";
  
    for (var i = 0; i < text.length; i++) {
      var c = text.charAt(i);
  
      if (c >= 'a' && c <= 'z') {
        encrypted += cipher.charAt(alphabet.indexOf(c));
      } else if (c >= 'A' && c <= 'Z') {
        encrypted += cipher.charAt(alphabet.indexOf(c.toLowerCase())).toUpperCase();
      } else if (c >= '0' && c <= '9') {
        encrypted += cipher.charAt(alphabet.indexOf(c));
      } else {
        encrypted += c;
      }
    }
  
    return encrypted;
  }
  
  function decryptWithKeywordCipher(encrypted, keyword) {
    var alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
    var cipher = "";
    var key = "";
  
    for (var i = 0; i < keyword.length; i++) {
      if (key.indexOf(keyword.charAt(i)) == -1) {
        key += keyword.charAt(i);
      }
    }
  
    for (var i = 0; i < key.length; i++) {
      if (cipher.indexOf(key.charAt(i)) == -1) {
        cipher += key.charAt(i);
      }
    }
  
    for (var i = 0; i < alphabet.length; i++) {
      if (cipher.indexOf(alphabet.charAt(i)) == -1) {
        cipher += alphabet.charAt(i);
      }
    }
  
    var decrypted = "";
  
    for (var i = 0; i < encrypted.length; i++) {
      var c = encrypted.charAt(i);
  
      if (c >= 'a' && c <= 'z') {
        decrypted += alphabet.charAt(cipher.indexOf(c));
      } else if (c >= 'A' && c <= 'Z') {
        decrypted += alphabet.charAt(cipher.indexOf(c.toLowerCase())).toUpperCase();
      } else if (c >= '0' && c <= '9') {
        decrypted += alphabet.charAt(cipher.indexOf(c));
      } else {
        decrypted += c;
      }
    }
  
    return decrypted;
  }

// Import necessary libraries
const speechRecognition = webkitSpeechRecognition || SpeechRecognition;

function startSpeechRecognition() {
    // Create a new SpeechRecognition object
    let recognition = new webkitSpeechRecognition();

    // Set options for the recognition (e.g., language, max results)
    recognition.lang = "en-US";
    recognition.maxResults = 10;

    // Start the recognition process
    recognition.start();

    // Handle recognized text
    recognition.onresult = function(event) {
        let transcript = event.results[0][0].transcript;
        document.getElementById("text").value += transcript + "\n"; // Insert the recognized text into the "Enter Text" box
    };

    // Handle errors during recognition
    recognition.onerror = function(event) {
        console.error("Error occurred while recognizing speech:", event);
    };
}

// Biến toàn cục lưu ngày được chọn trên lịch (dạng yyyy-mm-dd)
var selectedDate = null;
function setSelectedDate(dateStr) {
  selectedDate = dateStr;
  autoFillKeyword(); // Tự động cập nhật keyword khi chọn ngày mới
  // Nếu đang mở popup lưu, cập nhật gợi ý tên file
  if (diaryMode === 'save') {
    document.getElementById('saveFileName').value = suggestDiaryFileName();
  }
}

// Function to auto-fill the keyword based on the date
function autoFillKeyword() {
  // Lấy ngày từ selectedDate nếu có, nếu không thì lấy ngày hiện tại
  var now;
  if (selectedDate) {
    var parts = selectedDate.split("-");
    now = new Date(parts[0], parts[1] - 1, parts[2]);
  } else {
    now = new Date();
  }

  // Get the day of the week
  const daysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const dayOfWeek = daysOfWeek[now.getDay()];

  // Get the day of the month
  const day = now.getDate();

  // Determine the suffix for the day
  let suffix = "th";
  if (day % 10 === 1 && day !== 11) suffix = "st";
  else if (day % 10 === 2 && day !== 12) suffix = "nd";
  else if (day % 10 === 3 && day !== 13) suffix = "rd";

  // Get the month abbreviation
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const month = months[now.getMonth()];

  // Get the year
  const year = now.getFullYear();

  // Construct the keyword
  const keyword = `${dayOfWeek}${suffix}${month}${year}`;

  // Set the keyword in the input field
  document.getElementById("keyword").value = keyword;
}

// Call the function to auto-fill the keyword when the page loads
window.onload = autoFillKeyword;


// Auto-resize textarea functionality
function autoResizeTextarea() {
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(Math.max(textarea.scrollHeight, 120), 500) + 'px';
  });
}

// Initialize Bootstrap tooltips and auto-resize for textareas
document.addEventListener('DOMContentLoaded', function() {
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    // Initial resize
    autoResizeTextarea();
    
    // Add input and change event listeners
    textarea.addEventListener('input', autoResizeTextarea);
    textarea.addEventListener('change', autoResizeTextarea);
  });

  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});

// Theme toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const icon = themeToggleBtn.querySelector('i');

    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-bs-theme', savedTheme);
    updateThemeIcon(savedTheme === 'dark');

    // Toggle theme
    themeToggleBtn.addEventListener('click', () => {
        const isDark = htmlElement.getAttribute('data-bs-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-bs-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(!isDark);
    });

    function updateThemeIcon(isDark) {
        icon.classList.remove('bi-sun-fill', 'bi-moon-stars-fill');
        icon.classList.add(isDark ? 'bi-moon-stars-fill' : 'bi-sun-fill');
    }
});

