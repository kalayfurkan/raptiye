const chatMessages = document.getElementById('chat-messages');
const sendButton = document.getElementById('btn-send');

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function scrollToSendButton() {
    sendButton.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

document.addEventListener('DOMContentLoaded', function() {
    scrollToBottom();
    scrollToSendButton();
});