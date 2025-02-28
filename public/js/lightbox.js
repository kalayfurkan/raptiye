
document.addEventListener('DOMContentLoaded', function() {
    // Get all carousel images
    const carouselItems = document.querySelectorAll('.carousel-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeLightbox = document.querySelector('.close-lightbox');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    let currentImageIndex = 0;
    let images = [];
    
    // Collect all images from carousel
    carouselItems.forEach(item => {
      const img = item.querySelector('img');
      if (img) {
        images.push(img.src);
      }
    });
    
    // Add click event to all carousel images
    carouselItems.forEach((item, index) => {
      const img = item.querySelector('img');
      if (img) {
        img.addEventListener('click', function() {
          openLightbox(index);
        });
      }
    });
    
    function openLightbox(index) {
      currentImageIndex = index;
      lightbox.style.display = 'flex';
      lightboxImg.src = images[currentImageIndex];
      
      // Show/hide navigation buttons based on number of images
      if (images.length <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
      } else {
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';
      }
      
      // Prevent scrolling when lightbox is open
      document.body.style.overflow = 'hidden';
    }
    
    function closeLightboxView() {
      lightbox.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
    
    function showPrevImage() {
      currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
      lightboxImg.src = images[currentImageIndex];
    }
    
    function showNextImage() {
      currentImageIndex = (currentImageIndex + 1) % images.length;
      lightboxImg.src = images[currentImageIndex];
    }
    
    // Close lightbox when clicking the close button
    closeLightbox.addEventListener('click', closeLightboxView);
    
    // Navigation buttons
    prevBtn.addEventListener('click', showPrevImage);
    nextBtn.addEventListener('click', showNextImage);
    
    // Close lightbox when clicking outside the image
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) {
        closeLightboxView();
      }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (lightbox.style.display === 'flex') {
        if (e.key === 'Escape') {
          closeLightboxView();
        } else if (e.key === 'ArrowLeft') {
          showPrevImage();
        } else if (e.key === 'ArrowRight') {
          showNextImage();
        }
      }
    });
  });