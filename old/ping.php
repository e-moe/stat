<?php

include 'Ping.php';
use \JJG\Ping as Ping;

header('Content-Type: application/json');

$result = [
    'status' => 'ok',
    'message' => '',
    'result' => null,
];

$raw_ip = isset($_GET['ip']) ? $_GET['ip'] : null;

if ($ip = filter_var($raw_ip, FILTER_VALIDATE_IP)) {
    $ping = new Ping($ip);
    $latency = $ping->ping();
    $result['result']['latency'] = $latency;
    $result['result']['ip'] = $ip;
} else {
    $result['message'] = 'Wrong IP address: ' . $raw_ip;
    $result['status'] = 'error';
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);