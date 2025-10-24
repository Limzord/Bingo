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

$unixUser = $_SESSION['unix_user'];
$userFilename = "$dir/{$unixUser}.json";

$sessionId = session_id();
$guestFilename = "$dir/guest_{$sessionId}.json";

if (!file_exists($guestFilename)) {
    echo json_encode(["success" => false, "message" => "There is no guest save to move"]);
}

if (file_exists($userFilename)) {
    echo json_encode(["success" => false, "message" => "User already has a save file"]);
    exit;
}

if (rename($guestFilename,$userFilename)) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "Couldn't move save file to user"]);
}

?>