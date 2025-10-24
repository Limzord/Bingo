<?php

require_once 'session_manager.php';

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