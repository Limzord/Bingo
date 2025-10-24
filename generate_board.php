<?php

require_once 'session_manager.php';

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


$elementsEncoded = json_encode($elements);

require 'file_operations.php';

$filename = getFileName($_SESSION, session_id());

saveFile($filename, $elementsEncoded);

echo $elementsEncoded;

?>