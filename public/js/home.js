document.querySelectorAll('.feature').forEach((feature, index) => {
    const pattern = ['align-left', 'align-right', 'align-left', 'align-left', 'align-right', 'align-left'];
    feature.classList.add(pattern[index % pattern.length]);
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        } else {
            entry.target.classList.remove('show');
        }
    });
});

const hiddenElements = document.querySelectorAll('.feature'); //effect e sahip olacak olan tagler
hiddenElements.forEach((el) => observer.observe(el));


document.addEventListener('DOMContentLoaded', () => {
    const sliders = document.querySelectorAll('.image-slider'); // Select all sliders

    sliders.forEach(slider => {
        const images = slider.querySelectorAll('.slider-image');
        const totalImages = images.length;

        if (totalImages > 1) { // Apply logic only if there's more than one image
        let currentIndex = Array.from(images).findIndex(img => img.classList.contains('active'));
        if (currentIndex === -1) currentIndex = 0;

        const intervalTime = 3000;

        const showNextImage = () => {
            const currentImage = images[currentIndex];
            const nextIndex = (currentIndex + 1) % totalImages;
            const nextImage = images[nextIndex];

            currentImage.classList.add('previous');
            nextImage.classList.add('active');

            setTimeout(() => {
            currentImage.classList.remove('active', 'previous');
            currentIndex = nextIndex;
            }, 1000);
        };

        setInterval(showNextImage, intervalTime);
        }
    });
});