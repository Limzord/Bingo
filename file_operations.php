<?php
function getFilename($session, $sessionId) {
    if (isset($session['unix_user'])) {
        $filename = getUserFilename($session);
    } else {
        $filename = getGuestFilename($sessionId);
    }
    return $filename;
}

function getUserFilename($session) {
    $unixUser = $session['unix_user'];
    return "{$unixUser}.json";
}

function getGuestFilename($sessionId) {
    return "guest_{$sessionId}.json";
}

function getDirectory() {
    return __DIR__ . "/saves";
}

function loadFile($filename) {
    $directory = getDirectory();
    $fileLocation = "$directory/$filename";

    if (!file_exists($fileLocation)) {
        return null;
    }

    $data = file_get_contents($fileLocation);
    return $data;
}

function saveFile($filename, $data) {
    $directory = getDirectory();
    if (!is_dir($directory)) mkdir($directory, 0700, true);
    $fileLocation = "$directory/$filename";

    if (file_put_contents($fileLocation, $data)) {
        return json_encode(['success' => true]);
    } else {
        return json_encode(['success' => false, 'message' => 'Failed to write save file']);
    }
}

function deleteFile($filename) {
    $directory = getDirectory();
    $fileLocation = "$directory/$filename";

    if (unlink($fileLocation)) {
        return json_encode(['success' => true, 'message' => 'Successfully deleted save data']);
    } else {
        return json_encode(['success' => false, 'message' => 'Failed to delete save data']);
    }
}
?>