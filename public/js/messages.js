const chatMessages = document.getElementById('chat-messages');
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

//daha fazla bölümünün çalışması için
document.addEventListener('DOMContentLoaded', function() {
    // Iterate over each message bubble
    document.querySelectorAll('.message-content').forEach(function(messageContent) {
        const maxVisibleHeight = 50; // Change this value to the height limit you want
        const messageHeight = messageContent.scrollHeight;
        const readMoreLink = messageContent.nextElementSibling; // Updated to grab the next element (Daha fazla link)

        // Check if message is taller than the max visible height
        if (messageHeight > maxVisibleHeight) {
            // Add the "daha-fazla" link and limit the height initially
            messageContent.style.maxHeight = maxVisibleHeight + 'px';
            messageContent.style.overflow = 'hidden';
            readMoreLink.style.display = 'block'; // Show the "Daha fazla" link

            // Toggle the message when "Daha fazla" is clicked
            readMoreLink.addEventListener('click', function() {
                if (messageContent.style.maxHeight === maxVisibleHeight + 'px') {
                    messageContent.style.maxHeight = messageHeight + 'px'; // Expand to full height
                    readMoreLink.textContent = 'Daha az'; // Change text to "Daha az"
                } else {
                    messageContent.style.maxHeight = maxVisibleHeight + 'px'; // Collapse
                    readMoreLink.textContent = 'Daha fazla'; // Change text back to "Daha fazla"
                }
            });
        }
    });
    scrollToBottom();
});

