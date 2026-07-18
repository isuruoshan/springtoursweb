<?php
/**
 * Spring Tours — Booking Inquiry Mailer
 * Vanilla PHP (no framework, no CMS). Sends the multi-step booking
 * form to springtourslk@gmail.com and returns a JSON response for
 * the fetch() call in script.js.
 */

header('Content-Type: application/json');

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// ---- Config ----
$recipient   = 'springtourslk@gmail.com';
$siteName    = 'Spring Tours';

// ---- Helpers ----
function clean($value) {
    $value = trim($value ?? '');
    $value = stripslashes($value);
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

// ---- Collect & sanitize fields ----
$name      = clean($_POST['name']      ?? '');
$country   = clean($_POST['country']   ?? '');
$email     = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$phone     = clean($_POST['phone']     ?? '');
$arrival   = clean($_POST['arrival']   ?? '');
$departure = clean($_POST['departure'] ?? '');
$adults    = (int)($_POST['adults']    ?? 0);
$children  = (int)($_POST['children']  ?? 0);
$hotel     = clean($_POST['hotel']     ?? '');
$vehicle   = clean($_POST['vehicle']   ?? '');
$tourType  = clean($_POST['tourType']  ?? '');
$message   = clean($_POST['message']   ?? '');

// ---- Basic validation ----
$errors = [];
if ($name === '')  $errors[] = 'Name is required.';
if ($country === '') $errors[] = 'Country is required.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'A valid email is required.';
if ($phone === '') $errors[] = 'Phone number is required.';

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// ---- Build email ----
$subject = "New Tour Inquiry from {$name} ({$country}) — {$siteName}";

$body  = "You have a new booking inquiry from the Spring Tours website:\n\n";
$body .= "Name: {$name}\n";
$body .= "Country: {$country}\n";
$body .= "Email: {$email}\n";
$body .= "Phone: {$phone}\n";
$body .= "Arrival Date: {$arrival}\n";
$body .= "Departure Date: {$departure}\n";
$body .= "Adults: {$adults}\n";
$body .= "Children: {$children}\n";
$body .= "Hotel Category: {$hotel}\n";
$body .= "Vehicle Type: {$vehicle}\n";
$body .= "Tour Type: {$tourType}\n";
$body .= "Message:\n{$message}\n";

$headers   = [];
$headers[] = "From: {$siteName} Website <no-reply@springtours.lk>";
$headers[] = "Reply-To: {$name} <{$email}>";
$headers[] = "Content-Type: text/plain; charset=UTF-8";
$headers[] = "X-Mailer: PHP/" . phpversion();

$sent = @mail($recipient, $subject, $body, implode("\r\n", $headers));

if ($sent) {
    echo json_encode(['success' => true, 'message' => 'Inquiry sent successfully.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'The mail server could not send your inquiry. Please try WhatsApp instead.']);
}
