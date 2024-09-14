document.addEventListener('DOMContentLoaded', function () {
	// Tüm silme butonlarını seç
	document.querySelectorAll('form[action^="/deletefavorites"]').forEach(form => {
		form.addEventListener('submit', function (event) {
			event.preventDefault(); // Sayfanın kendi kendine yenilenmesini engelle

			const actionUrl = form.getAttribute('action'); // Formun action URL'sini al

			fetch(actionUrl, {
				method: 'POST', // POST isteği gönder
				headers: {
					'Content-Type': 'application/json'
				}
			})
				.then(response => {
					if (response.ok) {
						// Eğer POST isteği başarılı olursa sayfayı yenile
						window.location.reload();
					} else {
						alert('Bir hata oluştu.');
					}
				})
				.catch(error => console.error('Hata:', error));
		});
	});
});

document.addEventListener('DOMContentLoaded', function () {
    // Tüm iş ilanları ile ilgili silme butonlarını seç
    document.querySelectorAll('form[action^="/jobdeletefavorites"]').forEach(form => {
        form.addEventListener('submit', function (event) {
            event.preventDefault(); // Sayfanın kendi kendine yenilenmesini engelle

            const actionUrl = form.getAttribute('action'); // Formun action URL'sini al

            fetch(actionUrl, {
                method: 'POST', // POST isteği gönder
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        // Eğer POST isteği başarılı olursa sayfayı yenile
                        window.location.reload();
                    } else {
                        alert('Bir hata oluştu.');
                    }
                })
                .catch(error => console.error('Hata:', error));
        });
    });
});


document.addEventListener('DOMContentLoaded', function () {
    // Tüm iş ilanları ile ilgili silme butonlarını seç
    document.querySelectorAll('form[action^="/kiradeletefavorites"]').forEach(form => {
        form.addEventListener('submit', function (event) {
            event.preventDefault(); // Sayfanın kendi kendine yenilenmesini engelle

            const actionUrl = form.getAttribute('action'); // Formun action URL'sini al

            fetch(actionUrl, {
                method: 'POST', // POST isteği gönder
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        // Eğer POST isteği başarılı olursa sayfayı yenile
                        window.location.reload();
                    } else {
                        alert('Bir hata oluştu.');
                    }
                })
                .catch(error => console.error('Hata:', error));
        });
    });
});
