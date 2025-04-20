const monthYearElement = document.getElementById('month-year');
const calendarDaysElement = document.getElementById('calendar-days');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

let currentDate = new Date();

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Set the month and year in the header
    monthYearElement.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

    // Clear previous days and day names
    calendarDaysElement.innerHTML = '';

    // Add day names dynamically
    dayNames.forEach(dayName => {
        const dayNameDiv = document.createElement('div');
        dayNameDiv.textContent = dayName;
        dayNameDiv.classList.add('day-name');
        calendarDaysElement.appendChild(dayNameDiv);
    });

    // Get the first day of the month and the number of days in the month
    let firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Adjust firstDay to start the week on Monday
    firstDay = (firstDay === 0) ? 6 : firstDay - 1;

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('empty'); // Add a class for styling empty slots
        calendarDaysElement.appendChild(emptyDiv);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.textContent = day;
        dayDiv.classList.add('day'); // Add a class for styling days
        calendarDaysElement.appendChild(dayDiv);
    }

    // Ensure the grid always has 6 rows (42 slots)
    const totalSlots = firstDay + daysInMonth;
    const extraSlots = 42 - totalSlots;
    for (let i = 0; i < extraSlots; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('empty');
        calendarDaysElement.appendChild(emptyDiv);
    }
}

// Add event listener to handle day click and auto-fill the keyword
function handleDayClick(event) {
    if (event.target.classList.contains('day')) {
        const clickedDay = parseInt(event.target.textContent, 10);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Get the day of the week
        const daysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
        const date = new Date(year, month, clickedDay);
        const dayOfWeek = daysOfWeek[date.getDay()];

        // Determine the suffix for the day
        let suffix = "th";
        if (clickedDay % 10 === 1 && clickedDay !== 11) suffix = "st";
        else if (clickedDay % 10 === 2 && clickedDay !== 12) suffix = "nd";
        else if (clickedDay % 10 === 3 && clickedDay !== 13) suffix = "rd";

        // Get the month abbreviation
        const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        const monthAbbreviation = months[month];

        // Construct the keyword
        const keyword = `${dayOfWeek}${suffix}${monthAbbreviation}${year}`;

        // Set the keyword in the input field
        document.getElementById("keyword").value = keyword;
    }
}

// Attach the event listener to the calendar days container
calendarDaysElement.addEventListener('click', handleDayClick);

prevMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Initial render
renderCalendar();