<?php

require_once 'session_manager.php';

require 'file_operations.php';

echo deleteFile(getFilename($_SESSION, session_id()));

?>