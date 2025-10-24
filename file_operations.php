<?php
function getFilename($session, $sessionId) {
    if (isset($session['unix_user'])) {
        $unixUser = $session['unix_user'];
        $filename = "{$unixUser}.json";
    } else {
        $filename = "guest_{$sessionId}.json";
    }
    return $filename;
}

function loadFile($filename) {
    $dir = __DIR__ . "/saves";
    $fileLocation = "$dir/$filename";

    if (!file_exists($fileLocation)) {
        return null;
    }

    $data = file_get_contents($fileLocation);
    return $data;
}

function saveFile($filename, $data) {
    $dir = __DIR__ . "/saves";
    if (!is_dir($dir)) mkdir($dir, 0700, true);
    $fileLocation = "$dir/$filename";

    if (file_put_contents($fileLocation, $data)) {
        return json_encode(['success' => true]);
    } else {
        return json_encode(['success' => false, 'message' => 'Failed to write save file']);
    }
}
?>