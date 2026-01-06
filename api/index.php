<?php
 /** header("Location: login.php");
 *   exit;
 *   ?> )
*/
require __DIR__ . '/config.php';

if (!isset($_SESSION['auth'])) {
    require __DIR__ . '/login.php';
} else {
    require __DIR__ . '/upload.php';
}
