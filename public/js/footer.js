// Formu açan buton
document.getElementById('toggle-form').addEventListener('click', function () {
    const contactForm = document.getElementById('contact-form');
    contactForm.style.display = 'block'; // Formu göster
});

// Formu kapatan buton
document.getElementById('close-form').addEventListener('click', function () {
    const contactForm = document.getElementById('contact-form');
    contactForm.style.display = 'none'; // Formu gizle
});