<?php
require 'vendor/autoload.php';

use \JJG\Ping as Ping;

if(empty($_SERVER['HTTP_X_REQUESTED_WITH']) || strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) !== 'xmlhttprequest') {
    die('AJAX only');
}

header('Content-Type: application/json');

function getData($name, $src, $default = null)
{
    return isset($src[$name]) ? $src[$name] : $default;
}


$components = getData('components', $_POST);
$params = getData('params', $_POST);
$response = [];

$API_LIST = ['api_lan', 'api_top', 'api_sysinfo', 'api_uptime', 'api_hdd_temp', 'api_hdd_usage', 'api_hostname', 'api_wol'];

foreach($components as $c)
{
    $func = 'api_' . $c;
    if (in_array($func, $API_LIST) && is_callable($func)) {
        $response[$c] = call_user_func($func, $params[$c]);
    }
}

function api_lan($params)
{
    $response = [];
    foreach($params as $name => $ip) {
        $result = [
            'status' => 'ok',
            'message' => '',
            'result' => null,
        ];

        if ($ip = filter_var($ip, FILTER_VALIDATE_IP)) {
            $ping = new Ping($ip);
            $latency = $ping->ping();
            $result['result']['latency'] = $latency;
            $result['result']['ip'] = $ip;
        } else {
            $result['message'] = 'Wrong IP address: ' . $raw_ip;
            $result['status'] = 'error';
        }
        $response[$name] = $result;
    }

    return $response;
}

function api_top($params)
{
    $response = [];
    exec('top -b -n 1 | tail -n +8 | head -n 5', $top);
    foreach ($top as $line)
    {
        $proc = trim($line);
        list($pid, $user, $pr, $ni, $virt, $res, $shr, $s, $cpu, $mem, $time, $cmd) = preg_split("/\s+/", $proc);
        $response[] = [
            'pid'  => $pid,
            'user' => $user,
            'pr'   => $pr,
            'ni'   => $ni,
            'virt' => $virt,
            'res'  => $res,
            'shr'  => $shr,
            's'    => $s,
            'cpu'  => $cpu,
            'mem'  => $mem,
            'time' => $time,
            'cmd'  => $cmd,
        ];
    }
    return $response;
}

function api_sysinfo($params)
{
    $data = [
        'distribution' => trim(`lsb_release -a`),
        'cpu' => trim(`cat /proc/cpuinfo | tail -n +2 | head -n 7`),
        'memory' => trim(`cat /proc/meminfo | head -n 2`),
    ];
    foreach ($data as $key => $raw) {
        foreach (preg_split('/\n/', $raw) as $line) {
            list($prop, $val) = explode(':', $line);
            $response[$key][trim($prop)] = trim(preg_replace('/\s+/', ' ', $val));
        }

    }

    return $response;
}

function api_uptime($params)
{
    return [
        'uname'  => trim(`uname -a`),
        'uptime' => trim(`uptime`),
    ];
}

function api_hdd_temp($params)
{
    $response = [];
    // HDD temperature
    $hdd_list = exec('nc localhost 7634');
    $hdd_list = trim($hdd_list, '|');
    foreach (explode('||', $hdd_list) as $hdd_temp)
    {
        list($dev, $name, $deg, $dim) = explode('|', $hdd_temp);
        $response[] = [
            'dev' => $dev,
            'name' => $name,
            'deg' => $deg . ' &deg;' . $dim,
        ];
    }
    return $response;
}

function api_hdd_usage($params)
{
    $response = [];
    exec('df -h | tail -n +2', $hdd_mounts);
    foreach ($hdd_mounts as $mount)
    {
        list($fs, $size, $used, $avail, $use, $mounted) = preg_split("/\s+/", $mount);
        $response[] = [
            'fs' => $fs,
            'size' => $size,
            'used' => $used,
            'avail' => $avail,
            'use' => $use,
            'mounted' => $mounted,
        ];
    }
    return $response;
}

function api_hostname($params)
{
    return trim(`hostname`);
}

function api_wol($params)
{
    $map = [
        'desktop' => '00:23:54:47:d5:bc',
        'htpc'    => '00:50:8d:ba:bb:d2',
    ];
    $isLocalRequest = 0 === strpos($_SERVER['REMOTE_ADDR'], '192.168.0');
    $alias = $params;

    if ($isLocalRequest && isset($map[$alias])) {
        $command = 'wakeonlan ' . $map[$alias];
        $response = exec($command);
    } else {
        $response = 'Sprry, you can\' wake up "' . $alias . '"';
    }
    return $response;
}

echo json_encode($response);
