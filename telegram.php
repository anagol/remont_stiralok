<?php

// ===== ВАШИ ДАННЫЕ (ОБЯЗАТЕЛЬНО ЗАПОЛНИТЬ!) =====
// Токен, который вы получили от @BotFather
$botToken = '8320034909:AAGmmsHUX9yEQhyJNDJSXcJvWB7RxzXoiCU';
// ID чата, куда будут приходить сообщения
$chatId = '-4873417026';
// ===============================================

// Устанавливаем заголовок, чтобы браузер понимал, что ответ в формате JSON
header('Content-Type: application/json');

// Проверяем, что запрос был методом POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

// Получаем данные из формы и очищаем их от лишних пробелов и тегов
$name = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
$phone = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';
$userMessage = isset($_POST['message']) ? trim(strip_tags($_POST['message'])) : '';

// Простая валидация: проверяем, что поля не пустые
if (empty($name) || empty($phone) || empty($userMessage)) {
    echo json_encode(['success' => false, 'message' => 'Пожалуйста, заполните все поля.']);
    exit;
}

// Составляем сообщение для Telegram
$message = "<b>Новая заявка с сайта!</b>\n\n";
$message .= "<b>Имя:</b> " . htmlspecialchars($name) . "\n";
$message .= "<b>Телефон:</b> " . htmlspecialchars($phone) . "\n";
$message .= "<b>Неисправность:</b> " . htmlspecialchars($userMessage);

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
    echo json_encode(['success' => true]);
} else {
    // Если Telegram вернул ошибку, показываем ее для диагностики
    echo json_encode(['success' => false, 'message' => 'Ошибка Telegram: ' . $response]);
}

?>