// Script to add "Daha fazla" functionality for paragraphs longer than 340 characters
document.addEventListener('DOMContentLoaded', function() {
    // Iterate over each paragraph with class 'daha-fazla'
    document.querySelectorAll('p.daha-fazla').forEach(function(paragraph) {
        const maxChars = 340; // Character limit

        // Only add "Daha fazla" if the paragraph has more than 340 characters
        if (paragraph.textContent.length > maxChars) {
            // Add the 'collapsed' class to limit the height
            paragraph.classList.add('collapsed');

            // Create the "Daha fazla" link
            const readMoreLink = document.createElement('a');
            readMoreLink.href = '#'; // Link to nowhere
            readMoreLink.classList.add('daha-fazla-link');
            readMoreLink.textContent = 'Daha fazla';

            // Append the link after the paragraph
            paragraph.after(readMoreLink);

            // Toggle paragraph height on click
            readMoreLink.addEventListener('click', function(event) {
                event.preventDefault(); // Prevent the default anchor behavior

                if (paragraph.classList.contains('collapsed')) {
                    paragraph.classList.remove('collapsed'); // Expand
                    readMoreLink.textContent = 'Daha az'; // Change text to "Daha az"
                } else {
                    paragraph.classList.add('collapsed'); // Collapse
                    readMoreLink.textContent = 'Daha fazla'; // Change text back to "Daha fazla"
                }
            });
        }
    });
});