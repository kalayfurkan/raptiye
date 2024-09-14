document.addEventListener('DOMContentLoaded', function() {
    // Function to handle form submission
    function handleVoteFormSubmit(event) {
        event.preventDefault(); // Prevent the default form submission

        const form = event.target;
        const formId = form.id;
        const formAction = form.action;

        // Send AJAX request
        fetch(formAction, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}) // Send an empty body if not needed
        })
        .then(response => response.json())
        .then(data => {
            console.log('Server Response:', data); // Debug: Log server response
            if (data.success) {
                updateVotes(formId, data);
            } else {
                console.error('Vote request failed:', data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    // Function to update vote counts and button states
    function updateVotes(formId, data) {
        const [actionType, messageId] = formId.split('-');

        const upvoteButton = document.querySelector(`#upvote-${messageId}`);
        const undoUpvoteButton = document.querySelector(`#undo-upvote-${messageId}`);
        const downvoteButton = document.querySelector(`#downvote-${messageId}`);
        const undoDownvoteButton = document.querySelector(`#undo-downvote-${messageId}`);

        // Update button states based on the action type
        switch (data.type) {
            case 'upvote':
                if (upvoteButton) upvoteButton.style.display = 'none';
                if (undoUpvoteButton) undoUpvoteButton.style.display = 'inline';
                break;
            case 'undo-upvote':
                if (upvoteButton) upvoteButton.style.display = 'inline';
                if (undoUpvoteButton) undoUpvoteButton.style.display = 'none';
                break;
            case 'downvote':
                if (downvoteButton) downvoteButton.style.display = 'none';
                if (undoDownvoteButton) undoDownvoteButton.style.display = 'inline';
                break;
            case 'undo-downvote':
                if (downvoteButton) downvoteButton.style.display = 'inline';
                if (undoDownvoteButton) undoDownvoteButton.style.display = 'none';
                break;
        }

        // vote-render ile yapılıyor artık 
        // // Update vote counts
        // const upvoteCountElement = upvoteButton ? upvoteButton.querySelector('span') : undoUpvoteButton ? undoUpvoteButton.querySelector('span') : null;
        // const downvoteCountElement = downvoteButton ? downvoteButton.querySelector('span') : undoDownvoteButton ? undoDownvoteButton.querySelector('span') : null;

        // if (data.newUpvoteCount !== undefined && upvoteCountElement) {
        //     upvoteCountElement.textContent = data.newUpvoteCount;
        // }
        // if (data.newDownvoteCount !== undefined && downvoteCountElement) {
        //     downvoteCountElement.textContent = data.newDownvoteCount;
        // }
    }

    // Attach event listeners to all vote forms
    document.querySelectorAll('form[id^="upvote-"], form[id^="downvote-"], form[id^="undo-upvote-"], form[id^="undo-downvote-"]').forEach(form => {
        form.addEventListener('submit', handleVoteFormSubmit);
    });
});
