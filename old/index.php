<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Server stat</title>
    <link rel="stylesheet" href="css/style.css" />
    <link rel="stylesheet" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/themes/redmond/jquery-ui.css" />
    <meta name="mobile-web-app-capable" content="yes">
    <script data-main="js/main" src="js/require.js"></script>
  </head>
<body>

<div id="tabs">
	<ul>
		<li><a href="#tab-summary">Summary</a></li>
		<li><a href="#tab-sysinfo">Sysinfo</a></li>
        <li><a href="#tab-lan">LAN</a></li>
	</ul>
<?php
	$mc_key = 'stat.cache';
	$mc_cache_time = 5;
	$mc = new Memcache;
	/* connect to memcached server */
	$mc->connect('localhost');
	$mc_data = $mc->get($mc_key);
	if (FALSE === $mc_data) {
		ob_start();

		include 'tab-summary.php';
		include 'tab-sysinfo.php';
        include 'tab-lan.php';

		$out = ob_get_contents();
		ob_end_flush();
		$mc->set($mc_key, $out, 0, $mc_cache_time);
	} else {
		echo $mc_data;
	}
	$mc->close();
?>
</div>
</body>
</html>
