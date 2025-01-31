function initializeDahaFazla(className = 'daha-fazla', contentClass = 'daha-fazla-container', maxVisibleHeight = 50) {
    function updateDahaFazla() {
        document.querySelectorAll(`.${contentClass}`).forEach(function(messageContent) {
            // Temporarily show the container if it's hidden
            let originalDisplay = messageContent.style.display;
            if (originalDisplay === 'none') {
                messageContent.style.display = 'block';
            }

            const messageHeight = messageContent.scrollHeight;

            // Restore the original display value after height is calculated
            if (originalDisplay === 'none') {
                messageContent.style.display = originalDisplay;
            }

            // Only add the "Daha fazla" functionality if the content exceeds the maxVisibleHeight
            if (messageHeight > maxVisibleHeight) {
                // Limit the content height and hide overflow
                messageContent.style.maxHeight = maxVisibleHeight + 'px';
                messageContent.style.overflow = 'hidden';

                // Create the "Daha fazla" link if it doesn't exist
                let readMoreLink = messageContent.nextElementSibling;
                if (!readMoreLink || !readMoreLink.classList.contains(className)) {
                    readMoreLink = document.createElement('a');
                    readMoreLink.href = 'javascript:void(0);';
                    readMoreLink.className = className;
                    readMoreLink.textContent = 'Daha fazla';
                    readMoreLink.style.display = 'block';  // Make the link visible

                    // Insert the link right after the message content
                    messageContent.parentNode.insertBefore(readMoreLink, messageContent.nextSibling);

                    // Toggle between "Daha fazla" and "Daha az"
                    readMoreLink.addEventListener('click', function() {
                        if (messageContent.style.maxHeight === `${maxVisibleHeight}px`) {
                            messageContent.style.maxHeight = messageHeight + 'px';  // Expand content
                            readMoreLink.textContent = 'Daha az';  // Change link text
                        } else {
                            messageContent.style.maxHeight = maxVisibleHeight + 'px';  // Collapse content
                            readMoreLink.textContent = 'Daha fazla';  // Change link text back
                        }
                    });
                }
            } else {
                // Remove the "Daha fazla" link if the content does not exceed the maxVisibleHeight
                let readMoreLink = messageContent.nextElementSibling;
                if (readMoreLink && readMoreLink.classList.contains(className)) {
                    readMoreLink.remove();
                }
                messageContent.style.maxHeight = '';
                messageContent.style.overflow = '';
            }
        });
    }

    // Initial update
    updateDahaFazla();

    // Update on window resize
    window.addEventListener('resize', updateDahaFazla);
}

// Automatically initialize the feature when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeDahaFazla();  // Initialize with default values
});