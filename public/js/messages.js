const chatMessages = document.getElementById('chat-messages');
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.addEventListener('DOMContentLoaded', function() {
    scrollToBottom();
});

