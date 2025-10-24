<?php

require_once 'session_manager.php';

require 'file_operations.php';

$filename = getFileName($_SESSION, session_id());

$data = loadFile($filename);

if (!$data) {
    echo json_encode(["success" => false, "message" => "No save found"]);
    exit;
}

echo json_encode(["success" => true, "data" => json_decode($data, true)]);

?>