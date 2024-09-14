function upvoted(button, messageId) {
    button.classList.add('upvoted');

    const form = button.closest('form');
    if (form) {
      form.id = `undo-upvote-${messageId}`; // Change the ID from "upvote-123" to "undo-upvote-123"
      form.action = `/undo-upvote/${messageId}`; // Change action from "/upvote/123" to "/undo-upvote/123"
    }

    const span = button.querySelector('span');
    if (span) {
      let upvoteCount = parseInt(span.textContent, 10); // Get the current number inside the span
      upvoteCount += 1;
      span.textContent = upvoteCount; // Update the span's content with the new number
    }

    button.setAttribute('onclick', `undoUpvoted(this, '${messageId}')`);
  }

function undoUpvoted(button, messageId) {
    button.classList.remove('upvoted');

    const form = button.closest('form');
    if (form) {
      form.id = `upvote-${messageId}`; // Change the ID from "upvote-123" to "undo-upvote-123"
      form.action = `/upvote/${messageId}`; // Change action from "/upvote/123" to "/undo-upvote/123"
    }

    const span = button.querySelector('span');
    if (span) {
      let upvoteCount = parseInt(span.textContent, 10); // Get the current number inside the span
      upvoteCount -= 1;
      span.textContent = upvoteCount;
    }

    button.setAttribute('onclick', `upvoted(this, '${messageId}')`);
  }

function downvoted(button, messageId) {
    button.classList.add('downvoted');

    const form = button.closest('form');
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
      form.id = `downvote-${messageId}`; // Change the ID from "upvote-123" to "undo-upvote-123"
      form.action = `/downvote/${messageId}`; // Change action from "/upvote/123" to "/undo-upvote/123"
    }

    const span = button.querySelector('span');
    if (span) {
      let downvoteCount = parseInt(span.textContent, 10); // Get the current number inside the span
      downvoteCount -= 1;
      span.textContent = downvoteCount;
    }

    button.setAttribute('onclick', `downvoted(this, '${messageId}')`);
  }