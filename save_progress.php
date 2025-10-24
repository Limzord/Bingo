<?php
$session_lifetime = 7 * 24 * 60 * 60;
session_name('PHPSESSID');
session_set_cookie_params([
    'lifetime' => $session_lifetime,
    'path' => '/',
    'domain' => '.tmmd.club',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'Lax'
]);
session_start();

if (isset($_COOKIE[session_name()])) {
    setcookie(
        session_name(),
        $_COOKIE[session_name()],
        [
            'expires' => time() + $session_lifetime,
            'path' => '/',
            'domain' => '.tmmd.club',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Lax'
        ]
    );
}

header('Content-Type: application/json; charset=utf-8');

$dir = __DIR__ . "/saves";
if (!is_dir($dir)) mkdir($dir, 0700, true);

if (isset($_SESSION['unix_user'])) {
    $unixUser = $_SESSION['unix_user'];
    $filename = "$dir/{$unixUser}.json";
} else {
    $sessionId = session_id();
    $filename = "$dir/guest_{$sessionId}.json";
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

if (file_put_contents($filename, json_encode($input))) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to write save file']);
}

?>
