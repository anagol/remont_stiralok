
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('telegram-form');

    // Restrict input for the telephone field
    const phoneInputForFiltering = document.querySelector('input[type="tel"][name="phone"]');
    if (phoneInputForFiltering) {
        phoneInputForFiltering.addEventListener('input', function (e) {
            // Allow only numbers, +, -, (, ), and spaces
            e.target.value = e.target.value.replace(/[^0-9+()\- ]/g, '');
        });
    }

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault(); // Отменяем стандартную отправку формы

            const nameInput = form.querySelector('input[name="name"]');
            const phoneInput = form.querySelector('input[name="phone"]');
            const messageInput = form.querySelector('input[name="message"]'); // Исправлено
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;

            // Простое сообщение о статусе
            const statusMessage = document.createElement('small');
            statusMessage.style.display = 'block';
            statusMessage.style.marginTop = '10px';
            if (form.querySelector('small')) {
                 form.querySelector('small').insertAdjacentElement('afterend', statusMessage);
            } else {
                form.appendChild(statusMessage);
            }
            

            const formData = new FormData(form);
            
            submitButton.disabled = true;
            submitButton.textContent = 'Отправка...';
            statusMessage.textContent = '';

            fetch('telegram.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    statusMessage.textContent = 'Спасибо! Ваша заявка отправлена.';
                    statusMessage.style.color = 'green';
                    nameInput.value = ''; // Очищаем поля
                    phoneInput.value = '';
                    if (messageInput) messageInput.value = ''; // Исправлено
                } else {
                    // Показываем детальную ошибку от сервера
                    statusMessage.textContent = 'Ошибка: ' + (data.message || 'Неизвестная проблема. Попробуйте еще раз.');
                    statusMessage.style.color = 'red';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                statusMessage.textContent = 'Сетевая ошибка. Пожалуйста, проверьте подключение.';
                statusMessage.style.color = 'red';
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                 // Убираем сообщение через 5 секунд
                setTimeout(() => {
                    statusMessage.textContent = '';
                }, 5000);
            });
        });
    }
});
