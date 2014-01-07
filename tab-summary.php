<div id="tab-summary">
<pre>
<?php
	$out = '';
        // cowsay disk usage
        exec('df -h | perl /usr/games/cowthink -n', $df_arr);
        foreach ($df_arr as $df_str)
                $out .= "$df_str\n";
        $out .= "\n";


        $out .= "CPU\t";
/*      // CPU thermal info
        $cpu_thrminfo = exec('cat /proc/acpi/thermal_zone/THRM/temperature');
        $cpu_thrminfo = explode(':', $cpu_thrminfo);
        $out .= "\t" . trim($cpu_thrminfo[1]);
*/
        // CPU model name
        $cpu_mdl = exec("cat /proc/cpuinfo | grep -i 'model name'");
        $cpu_mdl = explode(':', $cpu_mdl);
        $out .= "\t" . trim($cpu_mdl[1]) . "\n";
        $out .= "\n";

        // HDD temperature
        $hdd_list = exec('nc localhost 7634');
        $hdd_list = trim($hdd_list, '|');
        foreach (explode('||', $hdd_list) as $hdd_temp)
        {
                $hdd_temp = explode('|', $hdd_temp);
                $out .= $hdd_temp[0] . "\t" . $hdd_temp[2] . ' ' . $hdd_temp[3] . "\t" . $hdd_temp[1] . "\n";
        }

        $out .= "\n" . `top -b -n 1 | tail -n +7 | head -n 6`;
        echo $out;
?>

<?php include 'tab-footer.php'; ?>
</pre>
</div>
