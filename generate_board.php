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

$possibleBingoSpaces = json_decode(file_get_contents(__DIR__ . '/bingo.json'), true);

$elements = [ 'values' => [], 'progress' => [] ];
$elements['values']['free'] = $possibleBingoSpaces['free'][array_rand($possibleBingoSpaces['free'])];
$elements['progress']['free'] = 'false';
for ($i = 1; $i <= 24; $i++) {
    $randomElement;
    do {
        $randomElement = $possibleBingoSpaces['values'][array_rand($possibleBingoSpaces['values'])];
    } while (in_array($randomElement, $elements['values']));
    $elements['values'][$i] = $randomElement;
    $elements['progress'][$i] = 'false';
}

echo json_encode($elements);

?>