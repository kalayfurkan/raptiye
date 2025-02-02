function initializeDahaFazla(className = 'daha-fazla', contentClass = 'daha-fazla-container', maxVisibleHeight = 50) {
    // First, clean up any existing daha-fazla links to prevent duplicates
    document.querySelectorAll(`.${className}`).forEach(link => link.remove());
    
    document.querySelectorAll(`.${contentClass}`).forEach(function(messageContent) {
        // Add smooth transition
        messageContent.style.transition = 'max-height 0.3s ease-out';
        
        // Get current display state
        let originalDisplay = messageContent.style.display;
        if (originalDisplay === 'none') {
            messageContent.style.display = 'block';
        }
        
        // Calculate height (now updates on each initialization)
        const messageHeight = messageContent.scrollHeight;
        
        // Restore original display
        if (originalDisplay === 'none') {
            messageContent.style.display = originalDisplay;
        }
        
        // Only add the functionality if content exceeds maxVisibleHeight
        if (messageHeight > maxVisibleHeight) {
            // Set initial state
            messageContent.style.maxHeight = maxVisibleHeight + 'px';
            messageContent.style.overflow = 'hidden';
            
            // Create the link
            const readMoreLink = document.createElement('a');
            readMoreLink.href = 'javascript:void(0);';
            readMoreLink.className = className;
            readMoreLink.textContent = 'daha fazla';
            readMoreLink.style.display = 'block';
            
            // Insert the link
            messageContent.parentNode.insertBefore(readMoreLink, messageContent.nextSibling);
            
            // Toggle functionality
            readMoreLink.addEventListener('click', function() {
                // Always recalculate height on click to handle dynamic content
                const currentHeight = messageContent.scrollHeight;
                
                if (messageContent.style.maxHeight === `${maxVisibleHeight}px`) {
                    messageContent.style.maxHeight = currentHeight + 'px';
                    readMoreLink.textContent = 'daha az';
                } else {
                    messageContent.style.maxHeight = maxVisibleHeight + 'px';
                    readMoreLink.textContent = 'daha fazla';
                }
            });
        }
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    initializeDahaFazla();
});

// Handle window resize with debounce
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        initializeDahaFazla();
    }, 250); // Debounce resize events
});