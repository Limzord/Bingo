<?php

require_once 'session_manager.php';

require 'file_operations.php';

echo moveFile(getGuestFilename(session_id()), getUserFilename($_SESSION));

?>