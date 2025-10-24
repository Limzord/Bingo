<?php

require_once 'session_manager.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

require 'file_operations.php';

$filename = getFileName($_SESSION, session_id());

$data = loadFile($filename);

if ($data) {
    $data = json_decode($data, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        $data = [];
    }
} else {
    $data = [];
}

$data['progress'] = $input['progress'];

$response = saveFile($filename, json_encode($data));

echo $response;

?>
