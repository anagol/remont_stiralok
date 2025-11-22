document.addEventListener('DOMContentLoaded', function () {
    const telegramForm = document.getElementById('telegram-form');

    if (telegramForm) {
        telegramForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(telegramForm);
            const submitButton = telegramForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;

            let statusMessage = telegramForm.querySelector('.status-message');
            if (!statusMessage) {
                statusMessage = document.createElement('small');
                statusMessage.className = 'status-message';
                statusMessage.style.display = 'block';
                statusMessage.style.marginTop = '10px';
                submitButton.parentNode.insertBefore(statusMessage, submitButton.nextSibling);
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Отправка...';
            statusMessage.textContent = '';

            fetch('telegram.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json().catch(() => {
                return { success: false, message: 'Не удалось обработать ответ сервера.' };
            }))
            .then(data => {
                if (data.success) {
                    statusMessage.textContent = 'Спасибо! Ваша заявка отправлена.';
                    statusMessage.style.color = 'green';
                    telegramForm.reset();
                } else {
                    statusMessage.textContent = 'Ошибка: ' + (data.message || 'Неизвестная проблема.');
                    statusMessage.style.color = 'red';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                statusMessage.textContent = 'Сетевая ошибка. Не удалось отправить заявку.';
                statusMessage.style.color = 'red';
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                if (statusMessage.style.color === 'green') {
                    setTimeout(() => {
                        if (statusMessage) statusMessage.textContent = '';
                    }, 5000);
                }
            });
        });
    }
});
