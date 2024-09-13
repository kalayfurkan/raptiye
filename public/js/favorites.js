document.addEventListener('DOMContentLoaded', function() {
    // Tüm form butonlarını seç
    document.querySelectorAll('button[data-ilan-id]').forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault(); // Sayfa yenilenmesini engelle
            
            const ilanId = button.getAttribute('data-ilan-id'); // Butonun data-ilan-id attribute'unu al
            const isFavorite = button.classList.contains('spin'); // Eğer butonda 'spin' class'ı varsa favorilerde
            
            // Eğer favorilerde ise DELETE isteği gönder, değilse POST isteği gönder
            const url = isFavorite ? `/deletefavorites/${ilanId}` : `/addfavoritesilan/${ilanId}`;
            const method = isFavorite ? 'POST' : 'POST';
            
            fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json()) // JSON yanıtını işle
            .then(data => {
                if (data.success) {
                    button.classList.toggle('spin'); // Eğer başarıyla eklendi/silindiyse buton class'ını değiştir
                } else {
                    alert('Bir hata oluştu.');
                }
            })
            .catch(error => console.error('Hata:', error));
        });
    });
});
