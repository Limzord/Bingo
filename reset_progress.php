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

header('Content-Type: application/json');

$dir = __DIR__ . "/saves";

if (isset($_SESSION['unix_user'])) {
    $unixUser = $_SESSION['unix_user'];
    $filename = "$dir/{$unixUser}.json";
} else {
    $sessionId = session_id();
    $filename = "$dir/guest_{$sessionId}.json";
}

if (unlink($filename)) {
    echo json_encode(['success' => true, 'message' => 'Successfully deleted save data']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to delete save data']);
}

?>