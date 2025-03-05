document.getElementById('navbar-toggle').addEventListener('click', function () {
    const menu = document.getElementById('navbar-menu');
    menu.style.display = 'block'; // set inline display so the transition happens and remove it after 0.3 seconds
    setTimeout(() => menu.style.display = '', 300);
    menu.classList.toggle('active');
    menu.style.maxHeight = menu.classList.contains('active') ? menu.scrollHeight + "px" : "0";
    
    if (menu.classList.contains('active')) {
        menu.style.overflow = 'hidden'; // Initially hidden during animation
        setTimeout(() => menu.style.overflow = 'visible', 500);
    } else {
        menu.style.overflow = 'hidden';
    }
});

// JavaScript to toggle ilanlar
document.querySelector('.ilanlar-toggle').addEventListener('click', function (e) {
    e.preventDefault();  // Prevent page jump on click
    const ilanlarDropdown = document.getElementById('ilanlar-dropdown');
    
    // Toggle the active class to open/close the dropdown
    ilanlarDropdown.classList.toggle('active');
});

// JavaScript to hide ilanlarDropdown when clicking outside
    document.addEventListener('click', function (e) {
    const ilanlarDropdown = document.getElementById('ilanlar-dropdown');
    const ilanlarToggle = document.querySelector('.ilanlar-toggle');
    if (!ilanlarDropdown.contains(e.target) && !ilanlarToggle.contains(e.target)) {
        ilanlarDropdown.classList.remove('active');
    }
});

// JavaScript to handle window resize
window.addEventListener('resize', function () {
    const menu = document.getElementById('navbar-menu');
    if (window.innerWidth > 850) {
        menu.style.maxHeight = 'none'; // Remove max-height
        menu.classList.remove('active'); // Remove active class
    } else {
        menu.style.maxHeight = '0'; // Reset max-height for smaller screens
    }
});

// Initial check to apply the correct styles on page load
if (window.innerWidth > 850) {
    const menu = document.getElementById('navbar-menu');
    menu.style.maxHeight = 'none'; // Remove max-height
    menu.classList.remove('active'); // Remove active class
}
