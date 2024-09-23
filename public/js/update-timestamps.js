function timeAgo(inputTime) {
    const now = new Date();
    const [date, time] = inputTime.split(" ");
    const [day, month, year] = date.split(".");
    const [hours, minutes, seconds] = time.split(":");

    const pastDate = new Date(year, month - 1, day, hours, minutes, seconds);
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
    } else if (now.getDate() === pastDate.getDate() + 1 && now.getMonth() === pastDate.getMonth() && now.getFullYear() === pastDate.getFullYear()) {
        return `dün`;
    } else if (now.getDate() === pastDate.getDate() + 2 && now.getMonth() === pastDate.getMonth() && now.getFullYear() === pastDate.getFullYear()) {
        return `geçen gün`;
    } else if (diff < oneMonth) {
        const daysAgo = Math.floor(diff / oneDay);
        return `${daysAgo} gün önce`;
    } else if (diff < oneYear) {
        const monthsAgo = Math.floor(diff / oneMonth);
        return `${monthsAgo} ay önce`;
    } else {
        const yearsAgo = Math.floor(diff / oneYear);
        return `${yearsAgo} yıl önce`;
    }
}

function updateTimestamps() {
    // Get all elements with the class 'timestamp'
    const timestamps = document.querySelectorAll('.timestamp');
    
    // Loop through each element and apply the timeAgo function
    timestamps.forEach(element => {
        const timeText = element.textContent; // Get the text content of the element
        const updatedTime = timeAgo(timeText); // Apply the timeAgo function
        element.textContent = updatedTime; // Update the text with the result
    });
}

// Call the updateTimestamps function when the page loads
window.onload = updateTimestamps;
