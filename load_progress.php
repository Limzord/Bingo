<?php

require_once 'session_manager.php';

require 'file_operations.php';

$filename = getFileName($_SESSION, session_id());

$dir = __DIR__ . "/saves";

if (isset($_SESSION['unix_user'])) {
    $unixUser = $_SESSION['unix_user'];
    $filename = "$dir/{$unixUser}.json";
} else {
    $sessionId = session_id();
    $filename = "$dir/guest_{$sessionId}.json";
}

if (!file_exists($filename)) {
    echo json_encode(["success" => false, "message" => "No save found"]);
    exit;
}

$data = file_get_contents($filename);
echo json_encode(["success" => true, "data" => json_decode($data, true)]);

?>