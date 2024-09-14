document.addEventListener('DOMContentLoaded', function() {
    // Function to handle form submission
    function handleVoteFormSubmit(event) {
        event.preventDefault(); // Prevent the default form submission

        const form = event.target;
        const formId = form.id;
        const formAction = form.action;

        const formData = new FormData(form); // Collect form data

        // Send AJAX request
        fetch(formAction, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: formData // Send form data as form-urlencoded
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

    function updateVotes(formId, data) {
        // Update the vote counts and form states based on response data
        const form = document.getElementById(formId);
        if (!form) return;

        const button = form.querySelector('button');
        if (!button) return;

        const messageId = formId.split('-').pop();
        
        if (formId.startsWith('undo-upvote')) {
            undoUpvoted(button, messageId);
        } else if (formId.startsWith('undo-downvote')) {
            undoDownvoted(button, messageId);
        } else if (formId.startsWith('upvote')) {
            upvoted(button, messageId);
        } else if (formId.startsWith('downvote')) {
            downvoted(button, messageId);
        }
    }

    function upvoted(button, messageId) {
        button.classList.add('upvoted');
        const form = button.closest('form');

        const siblingForm = document.querySelector(`#undo-downvote-${messageId}`);
        if (siblingForm) {
            const siblingButton = siblingForm.querySelector('button');
            undoDownvoted(siblingButton, messageId);
        }

        if (form) {
            form.id = `undo-upvote-${messageId}`;
            form.action = `/undo-upvote/${messageId}`;
        }

        const span = button.querySelector('span');
        if (span) {
            let upvoteCount = parseInt(span.textContent, 10);
            upvoteCount += 1;
            span.textContent = upvoteCount;
        }

        button.setAttribute('onclick', `undoUpvoted(this, '${messageId}')`);
    }

    function undoUpvoted(button, messageId) {
        button.classList.remove('upvoted');
        const form = button.closest('form');
        if (form) {
            form.id = `upvote-${messageId}`;
            form.action = `/upvote/${messageId}`;
        }

        const span = button.querySelector('span');
        if (span) {
            let upvoteCount = parseInt(span.textContent, 10);
            upvoteCount -= 1;
            span.textContent = upvoteCount;
        }

        button.setAttribute('onclick', `upvoted(this, '${messageId}')`);
    }

    function downvoted(button, messageId) {
        button.classList.add('downvoted');
        const form = button.closest('form');

        const siblingForm = document.querySelector(`#undo-upvote-${messageId}`);
        if (siblingForm) {
            const siblingButton = siblingForm.querySelector('button');
            undoUpvoted(siblingButton, messageId);
        }

        if (form) {
            form.id = `undo-downvote-${messageId}`;
            form.action = `/undo-downvote/${messageId}`;
        }

        const span = button.querySelector('span');
        if (span) {
            let downvoteCount = parseInt(span.textContent, 10);
            downvoteCount += 1;
            span.textContent = downvoteCount;
        }

        button.setAttribute('onclick', `undoDownvoted(this, '${messageId}')`);
    }

    function undoDownvoted(button, messageId) {
        button.classList.remove('downvoted');
        const form = button.closest('form');
        if (form) {
            form.id = `downvote-${messageId}`;
            form.action = `/downvote/${messageId}`;
        }

        const span = button.querySelector('span');
        if (span) {
            let downvoteCount = parseInt(span.textContent, 10);
            downvoteCount -= 1;
            span.textContent = downvoteCount;
        }

        button.setAttribute('onclick', `downvoted(this, '${messageId}')`);
    }

    // Attach event listeners to all vote forms
    document.querySelectorAll('form[id^="upvote-"], form[id^="downvote-"], form[id^="undo-upvote-"], form[id^="undo-downvote-"]').forEach(form => {
        form.addEventListener('submit', handleVoteFormSubmit);
    });
});
