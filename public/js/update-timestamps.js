function timeAgo(inputTime) {
    const now = new Date();

    // Trim the input and split into date and time
    const parts = inputTime.trim().split(" ");
    if (parts.length !== 2) {
        // If the input doesn't have exactly two parts, return it as is
        return inputTime;
    }

    const [date, time] = parts;

    const dateParts = date.split(".");
    if (dateParts.length !== 3) {
        // If the date doesn't have exactly three parts, return it as is
        return inputTime;
    }

    const timeParts = time.split(":");
    if (timeParts.length !== 3) {
        // If the time doesn't have exactly three parts, return it as is
        return inputTime;
    }

    const [day, month, year] = dateParts;
    const [hours, minutes, seconds] = timeParts;

    // Convert all parts to integers
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10) - 1; // Months are zero-based in JavaScript
    const yearNum = parseInt(year, 10);
    const hoursNum = parseInt(hours, 10);
    const minutesNum = parseInt(minutes, 10);
    const secondsNum = parseInt(seconds, 10);

    // Check for invalid number parsing
    if (
        isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum) ||
        isNaN(hoursNum) || isNaN(minutesNum) || isNaN(secondsNum)
    ) {
        return inputTime;
    }

    const pastDate = new Date(yearNum, monthNum, dayNum, hoursNum, minutesNum, secondsNum);

    // Check if the date is valid
    if (isNaN(pastDate.getTime())) {
        return inputTime;
    }

    const diff = (now - pastDate) / 1000; // difference in seconds

    const oneMinute = 60;
    const oneHour = 60 * oneMinute;
    const oneDay = 24 * oneHour;
    const oneMonth = 30 * oneDay;
    const oneYear = 365 * oneDay;

    // Helper function to format time as HH.MM
    const formatTime = (date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}.${minutes}`;
    };

    if (diff < oneHour) {
        return formatTime(pastDate);
    } else if (diff < oneDay) {
        return formatTime(pastDate);
    } else if (
        now.getFullYear() === pastDate.getFullYear() &&
        now.getMonth() === pastDate.getMonth() &&
        now.getDate() === pastDate.getDate() + 1
    ) {
        return `dün`;
    } else if (
        now.getFullYear() === pastDate.getFullYear() &&
        now.getMonth() === pastDate.getMonth() &&
        now.getDate() === pastDate.getDate() + 2
    ) {
        return `geçen gün`;
    } else if (diff < oneMonth) {
        const daysAgo = Math.floor(diff / oneDay);
        return `${daysAgo} gün`;
    } else if (diff < oneYear) {
        const monthsAgo = Math.floor(diff / oneMonth);
        return `${monthsAgo} ay`;
    } else {
        const yearsAgo = Math.floor(diff / oneYear);
        return `${yearsAgo} yıl`;
    }
}

function updateTimestamps() {
    // Get all elements with the class 'timestamp'
    const timestamps = document.querySelectorAll('.timestamp');

    // Loop through each element and apply the timeAgo function
    timestamps.forEach(element => {
        const timeText = element.textContent.trim(); // Trim the text content
        const updatedTime = timeAgo(timeText); // Apply the timeAgo function
        element.textContent = updatedTime; // Update the text with the result
    });
}

// Call the updateTimestamps function when the page loads
window.onload = updateTimestamps;