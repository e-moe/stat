<div id="tab-sysinfo">
<pre>
*** Distr:
<?= passthru('lsb_release -a') ?>

*** CPU Info:
<?= passthru('cat /proc/cpuinfo | tail -n +2 | head -n 7 ') ?>

*** Meminfo:
<?= passthru('cat /proc/meminfo | head -n 2') ?>

<?php include 'tab-footer.php'; ?>
</pre>
</div>
