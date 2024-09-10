document.addEventListener('DOMContentLoaded', function() {
    // Tüm form butonlarını seç
    document.querySelectorAll('button[data-ilan-id]').forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault(); // Sayfa yenilenmesini engelle
            
            const ilanId = button.getAttribute('data-ilan-id'); // Butonun data-ilan-id attribute'unu al
            
            fetch(`/addfavoritesilan/${ilanId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json()) // JSON yanıtını işle
            .then(data => {
                if (data.success) {
                    alert(data.message); // Tarayıcıda olan değişiklikleri buraya girmeniz gerekecek 
                } else {
                    alert('Bir hata oluştu.');
                }
            })
            .catch(error => console.error('Hata:', error));
        });
    });
});
