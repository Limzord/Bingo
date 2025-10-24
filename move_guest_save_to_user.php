<?php

require_once 'session_manager.php';

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