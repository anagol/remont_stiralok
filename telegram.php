<?php

// ===== ВАШИ ДАННЫЕ (ОБЯЗАТЕЛЬНО ЗАПОЛНИТЬ!) =====
// Токен, который вы получили от @BotFather
$botToken = '8320034909:AAGmmsHUX9yEQhyJNDJSXcJvWB7RxzXoiCU';
// ID чата, куда будут приходить сообщения
$chatId = '-4873417026';
// ===============================================

$bookingsFile = 'bookings.json';

// Устанавливаем заголовок, чтобы браузер понимал, что ответ в формате JSON
header('Content-Type: application/json');

// Проверяем, что запрос был методом POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

// Получаем данные из формы
$name = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
$phone = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';
$date = isset($_POST['date']) ? trim(strip_tags($_POST['date'])) : '';
$time = isset($_POST['time']) ? trim(strip_tags($_POST['time'])) : '';
$brand = isset($_POST['brand']) ? trim(strip_tags($_POST['brand'])) : 'Не указана';
$fault = isset($_POST['fault']) ? trim(strip_tags($_POST['fault'])) : 'Не указана';

// Валидация полей
if (empty($name) || empty($phone) || empty($date) || empty($time) || empty($fault)) {
    echo json_encode(['success' => false, 'message' => 'Пожалуйста, заполните все обязательные поля.']);
    exit;
}

// --- Проверка бронирования ---
$bookings = json_decode(file_get_contents($bookingsFile), true);
if ($bookings === null) {
    $bookings = [];
}

foreach ($bookings as $booking) {
    if ($booking['date'] === $date && $booking['time'] === $time) {
        echo json_encode(['success' => false, 'message' => 'К сожалению, это время уже занято. Пожалуйста, выберите другое.']);
        exit;
    }
}
// --- Конец проверки ---


// Составляем сообщение для Telegram
$message = "<b>🗓️ Новая запись на ремонт! 🗓️</b>\n\n";
$message .= "<b>Имя:</b> " . htmlspecialchars($name) . "\n";
$message .= "<b>Телефон:</b> " . htmlspecialchars($phone) . "\n";
$message .= "<b>Марка машины:</b> " . htmlspecialchars($brand) . "\n";
$message .= "<b>Неисправность:</b> " . htmlspecialchars($fault) . "\n";
$message .= "<b>Желаемая дата:</b> " . htmlspecialchars($date) . "\n";
$message .= "<b>Желаемое время:</b> " . htmlspecialchars($time);


// Формируем URL для отправки запроса к Telegram API
$url = "https://api.telegram.org/bot{$botToken}/sendMessage";

// Параметры запроса
$postFields = [
    'chat_id' => $chatId,
    'text' => $message,
    'parse_mode' => 'HTML' // Включаем поддержку HTML-тегов в сообщении
];

// Отправляем запрос с помощью cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Проверяем ответ от Telegram
if ($httpCode == 200) {
    // Если отправка успешна, сохраняем бронь
    $newBooking = ['date' => $date, 'time' => $time];
    $bookings[] = $newBooking;
    file_put_contents($bookingsFile, json_encode($bookings, JSON_PRETTY_PRINT));
    
    echo json_encode(['success' => true]);
} else {
    // Если Telegram вернул ошибку, показываем ее для диагностики
    echo json_encode(['success' => false, 'message' => 'Ошибка Telegram: ' . $response]);
}

?>