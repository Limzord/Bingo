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

if (!isset($_SESSION['user']) || !isset($_SESSION['unix_user'])) {
    echo json_encode(["success" => false, "message" => "Not logged in"]);
    exit;
}

$unixUser = $_SESSION['unix_user'];
$filename = __DIR__ . "/saves/{$unixUser}.json";

if (!file_exists($filename)) {
    echo json_encode(["success" => false, "message" => "No save found"]);
    exit;
}

$data = file_get_contents($filename);
echo json_encode(["success" => true, "data" => json_decode($data, true)]);
