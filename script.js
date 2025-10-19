
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

    // New code for calendar and modal
    const calendarEl = document.getElementById('calendar');
    const timeSlotsEl = document.getElementById('time-slots');
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close-button');
    const modalForm = document.getElementById('modal-form');
    const selectedDateInput = document.getElementById('selected-date');
    const selectedTimeInput = document.getElementById('selected-time');

    if (calendarEl && window.flatpickr) {
        flatpickr.localize(flatpickr.l10ns.ru);
        flatpickr(calendarEl, {
            inline: true,
            minDate: "today",
            onChange: function(selectedDates, dateStr, instance) {
                if (selectedDates[0]) {
                    selectedDateInput.value = dateStr;
                    generateTimeSlots();
                    timeSlotsEl.classList.remove('hidden');
                }
            },
        });
    }

    function generateTimeSlots() {
        timeSlotsEl.innerHTML = '';
        for (let i = 9; i <= 18; i++) {
            const timeSlot = document.createElement('div');
            timeSlot.classList.add('time-slot');
            timeSlot.textContent = `${i}:00`;
            timeSlot.addEventListener('click', () => {
                selectedTimeInput.value = `${i}:00`;
                modal.classList.remove('hidden');
            });
            timeSlotsEl.appendChild(timeSlot);
        }
    }

    if(closeModal) {
        closeModal.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.add('hidden');
        }
    });

    if (modalForm) {
        modalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(modalForm);
            const submitButton = modalForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;

            let statusMessage = modal.querySelector('.status-message');
            if (!statusMessage) {
                statusMessage = document.createElement('small');
                statusMessage.className = 'status-message';
                statusMessage.style.display = 'block';
                statusMessage.style.marginTop = '10px';
                submitButton.insertAdjacentElement('afterend', statusMessage);
            }

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
                    modalForm.reset();
                    setTimeout(() => {
                         modal.classList.add('hidden');
                    }, 2000);
                } else {
                    statusMessage.textContent = 'Ошибка: ' + (data.message || 'Неизвестная проблема.');
                    statusMessage.style.color = 'red';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                statusMessage.textContent = 'Сетевая ошибка.';
                statusMessage.style.color = 'red';
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                setTimeout(() => {
                    if (statusMessage) statusMessage.textContent = '';
                }, 5000);
            });
        });
    }
});
