const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(cors());

const PORT = 3000; // Bạn có thể đổi port nếu muốn
const DIARY_DIR = path.join(__dirname, 'diaries'); // Thay đổi tên "yriaD" thành "diaries" 

// Đảm bảo thư mục diaries tồn tại
if (!fs.existsSync(DIARY_DIR)) {
  fs.mkdirSync(DIARY_DIR);
}

app.use(express.static(__dirname));
app.use(express.json());

// Mặc định truy cập / sẽ trả về Promt1.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Promt1.html'));
});

// API lưu nhật ký
app.post('/api/save-diary', (req, res) => {
  const { filename, content, year } = req.body;
  if (!filename || !content || !year) {
    return res.status(400).json({ error: 'Missing filename, content, or year' });
  }
  // Nếu year là 'Special' thì giữ nguyên, nếu year là số (năm) thì lấy số, còn lại giữ nguyên tên folder
  let safeYear;
  if (year === 'Special') {
    safeYear = 'Special';
  } else if (/^\d{4}$/.test(year)) {
    safeYear = year.replace(/[^0-9]/g, '');
  } else {
    safeYear = year.trim();
  }
  // Chỉ loại ký tự nguy hiểm, giữ nguyên dấu tiếng Việt và trim khoảng trắng
  const safeName = filename.trim().replace(/[\/:*?"<>|]/g, '');
  const dirPath = path.join(DIARY_DIR, safeYear);
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create folder' });
  }
  const filePath = path.join(dirPath, safeName);
  fs.writeFile(filePath, content, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to save diary' });
    res.json({ message: 'Diary saved successfully' });
  });
});

// API tạo thư mục mới cho nhật ký
app.post('/api/create-folder', (req, res) => {
  const { folder } = req.body;
  if (!folder) return res.status(400).json({ error: 'Missing folder name' });
  // Không cho tạo folder trùng tên năm hoặc Special đã có
  const safeFolder = folder.trim().replace(/[\\/:*?"<>|]/g, '');
  const dirPath = path.join(DIARY_DIR, safeFolder);
  if (fs.existsSync(dirPath)) {
    return res.status(400).json({ error: 'Folder already exists' });
  }
  try {
    fs.mkdirSync(dirPath, { recursive: true });
    res.json({ message: 'Folder created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// API đọc nhật ký
// API đọc nhật ký
app.get('/api/read-diary', (req, res) => {
  const { filename, year } = req.query;
  if (!filename || !year) {
    return res.status(400).json({ error: 'Missing filename or year' });
  }
  // Nếu year là 'Special' thì giữ nguyên, nếu year là số (năm) thì lấy số, còn lại giữ nguyên tên folder
  let safeYear;
  if (year === 'Special') {
    safeYear = 'Special';
  } else if (/^\d{4}$/.test(year)) {
    safeYear = year.replace(/[^0-9]/g, '');
  } else {
    safeYear = year.trim();
  }
  // Chỉ loại ký tự nguy hiểm, giữ nguyên dấu tiếng Việt và trim khoảng trắng
  const safeName = filename.trim().replace(/[\/:*?"<>|]/g, '');
  const filePath = path.join(DIARY_DIR, safeYear, safeName);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(404).json({ error: 'Diary not found' });
    res.json({ content: data });
  });
});

// API lấy danh sách file nhật ký theo năm
app.get('/api/list-diaries', (req, res) => {
  const { year } = req.query;
  if (!year) {
    return res.status(400).json({ error: 'Missing year' });
  }
  // Nếu year là 'Special' thì giữ nguyên, nếu year là số (năm) thì lấy số, còn lại giữ nguyên tên folder
  let safeYear;
  if (year === 'Special') {
    safeYear = 'Special';
  } else if (/^\d{4}$/.test(year)) {
    safeYear = year.replace(/[^0-9]/g, '');
  } else {
    safeYear = year.trim();
  }
  const dirPath = path.join(DIARY_DIR, safeYear);
  fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to list diaries' });
    // Lọc chỉ lấy file .txt, không lấy folder con
    const txtFiles = files.filter(f => f.isFile() && f.name.endsWith('.txt')).map(f => f.name);
    res.json({ files: txtFiles });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
// API lấy danh sách folder nhật ký
app.get('/api/list-folders', (req, res) => {
  try {
    const folders = fs.readdirSync(DIARY_DIR, { withFileTypes: true })
      .filter(f => f.isDirectory())
      .map(f => f.name);
    res.json({ folders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list folders' });
  }
});
