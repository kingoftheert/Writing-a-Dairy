function encryptText() {
    var text = document.getElementById("text").value;
    var keyword = document.getElementById("keyword").value;
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
  
  function saveResult() {
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

    // Append the keyword to the result
    var contentToSave = `${result}\n\n'${keyword}'`;

    // Lấy ngày từ selectedDate nếu có, nếu không thì lấy ngày hiện tại
    var now;
    if (selectedDate) {
      var parts = selectedDate.split("-");
      now = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      now = new Date();
    }
    var day = now.getDate();
    var month = now.getMonth() + 1; // Months are zero-based
    var year = now.getFullYear();

    // Get the day of the week in Vietnamese
    var daysOfWeek = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    var vietnameseDay = daysOfWeek[now.getDay()];

    // Format the file name
    var fileName = `${vietnameseDay} ngày ${day} tháng ${month} năm ${year}.txt`;

    // Create a Blob and trigger the download
    var blob = new Blob([contentToSave], { type: "text/plain" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
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

// Check if the browser supports the Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  alert("Your browser does not support speech recognition. Please use a modern browser like Chrome.");
} else {
  const recognition = new SpeechRecognition();

  // Configure the recognition settings
  recognition.lang = 'vn-VN'; // Set the language (change to your desired language)
  recognition.interimResults = false; // Only return final results
  recognition.maxAlternatives = 1;

  // Function to start speech recognition
  function startSpeechRecognition() {
    recognition.start();
    console.log("Speech recognition started...");
  }

  // Event: When speech recognition returns a result
  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript; // Get the transcribed text
    console.log("Transcript:", transcript);

    // Append the transcribed text to the textarea
    const textArea = document.getElementById("text");
    textArea.value += transcript;
  };

  // Event: When speech recognition ends
  recognition.onspeechend = function () {
    recognition.stop();
    console.log("Speech recognition stopped.");
  };

  // Event: Handle errors
  recognition.onerror = function (event) {
    console.error("Speech recognition error:", event.error);
    alert("An error occurred during speech recognition: " + event.error);
  };
}

// Biến toàn cục lưu ngày được chọn trên lịch (dạng yyyy-mm-dd)
var selectedDate = null;
function setSelectedDate(dateStr) {
  selectedDate = dateStr;
  autoFillKeyword(); // Tự động cập nhật keyword khi chọn ngày mới
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

// Function to read a diary file
function readDiary() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".txt";

  input.onchange = function (event) {
    const file = event.target.files[0];

    if (!file) {
      alert("No file selected!");
      return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
      const content = e.target.result;

      const [result, keyword] = content.split("\n\n'");

      document.getElementById("text").value = result || "";
      document.getElementById("keyword").value = keyword ? keyword.replace("'", "") : "";

      // Auto-resize after loading content
      autoResizeTextarea();
    };

    reader.readAsText(file);
  };

  input.click();
}

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