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
            //console.log('Server Response:', data); // Debug: Log server response
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

    // Helper to update vote state (activation or deactivation)
    function handleVoteChange(button, messageId, type, isActivating) {
        const form = button.closest('form');
        const span = button.querySelector('span');
        if (type === 'upvote') {
            if (isActivating) {
                button.classList.add('upvoted');
                if (form) { form.id = `undo-upvote-${messageId}`; form.action = `/undo-upvote/${messageId}`; }
                if (span) { span.textContent = parseInt(span.textContent, 10) + 1; }
                button.setAttribute('onclick', `undoUpvoted(this, '${messageId}')`);
            } else {
                button.classList.remove('upvoted');
                if (form) { form.id = `upvote-${messageId}`; form.action = `/upvote/${messageId}`; }
                if (span) { span.textContent = parseInt(span.textContent, 10) - 1; }
                button.setAttribute('onclick', `upvoted(this, '${messageId}')`);
            }
        } else if (type === 'downvote') {
            if (isActivating) {
                button.classList.add('downvoted');
                if (form) { form.id = `undo-downvote-${messageId}`; form.action = `/undo-downvote/${messageId}`; }
                if (span) { span.textContent = parseInt(span.textContent, 10) + 1; }
                button.setAttribute('onclick', `undoDownvoted(this, '${messageId}')`);
            } else {
                button.classList.remove('downvoted');
                if (form) { form.id = `downvote-${messageId}`; form.action = `/downvote/${messageId}`; }
                if (span) { span.textContent = parseInt(span.textContent, 10) - 1; }
                button.setAttribute('onclick', `downvoted(this, '${messageId}')`);
            }
        }
    }

    // Refactored vote functions using the helper
    function upvoted(button, messageId) {
        handleVoteChange(button, messageId, 'upvote', true);
        const siblingForm = document.querySelector(`#undo-downvote-${messageId}`);
        if (siblingForm) {
            const siblingButton = siblingForm.querySelector('button');
            if (siblingButton) { handleVoteChange(siblingButton, messageId, 'downvote', false); }
        }
    }

    function undoUpvoted(button, messageId) {
        handleVoteChange(button, messageId, 'upvote', false);
    }

    function downvoted(button, messageId) {
        handleVoteChange(button, messageId, 'downvote', true);
        const siblingForm = document.querySelector(`#undo-upvote-${messageId}`);
        if (siblingForm) {
            const siblingButton = siblingForm.querySelector('button');
            if (siblingButton) { handleVoteChange(siblingButton, messageId, 'upvote', false); }
        }
    }

    function undoDownvoted(button, messageId) {
        handleVoteChange(button, messageId, 'downvote', false);
    }

    // Attach event listeners to all vote forms
    document.querySelectorAll('form[id^="upvote-"], form[id^="downvote-"], form[id^="undo-upvote-"], form[id^="undo-downvote-"]').forEach(form => {
        form.addEventListener('submit', handleVoteFormSubmit);
    });
});
