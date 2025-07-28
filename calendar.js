// Calendar initialization
const monthYearElement = document.getElementById('month-year');
const calendarDaysElement = document.getElementById('calendar-days');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
let currentDate = new Date();

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthYearElement.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;
    calendarDaysElement.innerHTML = '';

    // Add day names
    dayNames.forEach(dayName => {
        const dayNameDiv = document.createElement('div');
        dayNameDiv.textContent = dayName;
        dayNameDiv.classList.add('day-name');
        calendarDaysElement.appendChild(dayNameDiv);
    });

    let firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    firstDay = (firstDay === 0) ? 6 : firstDay - 1;

    // Add empty cells for start of month
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('empty');
        calendarDaysElement.appendChild(emptyDiv);
    }

    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day');
        dayDiv.setAttribute('data-day', day);
        
        if (isCurrentMonth && day === today.getDate()) {
            dayDiv.classList.add('today');
        }
        
        dayDiv.addEventListener('click', () => handleDayClick(day));
        calendarDaysElement.appendChild(dayDiv);
    }

    // Fill remaining grid cells
    const totalCells = firstDay + daysInMonth;
    const remainingCells = Math.ceil(totalCells / 7) * 7 - totalCells;
    
    for (let i = 0; i < remainingCells; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('empty');
        calendarDaysElement.appendChild(emptyDiv);
    }
}

// Event listeners for month navigation
prevMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Handle day click events
function handleDayClick(day) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, day);

    // Gọi setSelectedDate để cập nhật ngày chọn cho script.js
    const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    if (typeof setSelectedDate === 'function') {
        setSelectedDate(dateStr);
    }

    // Get the day of the week
    const daysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const dayOfWeek = daysOfWeek[date.getDay()];

    // Get the suffix
    let suffix = "th";
    if (day % 10 === 1 && day !== 11) suffix = "st";
    else if (day % 10 === 2 && day !== 12) suffix = "nd";
    else if (day % 10 === 3 && day !== 13) suffix = "rd";

    // Get month abbreviation
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const monthAbbr = months[month];

    // Update keyword input
    document.getElementById("keyword").value = `${dayOfWeek}${suffix}${monthAbbr}${year}`;
    
    // Update selected state
    document.querySelectorAll('.calendar-day').forEach(div => div.classList.remove('selected'));
    const selectedDiv = Array.from(document.querySelectorAll('.calendar-day')).find(div => 
        parseInt(div.getAttribute('data-day')) === day
    );
    if (selectedDiv) {
        selectedDiv.classList.add('selected');
    }
}

// Initial render
renderCalendar();