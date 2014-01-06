<!DOCTYPE html>
<html>
  <head>
    <title>Server stat</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Bootstrap -->
    <link href="css/bootstrap.min.css" rel="stylesheet">

    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
      <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
    <![endif]-->
  </head>
  <body>
    <div class="container">
        <div class="page-header">
            <h1>Server stat <small class="api-hostname"></small></h1>
        </div>

        <div class="row">
            <div class="col-md-7">
                <div class="panel panel-default">
                    <div class="panel-heading"><span class="glyphicon glyphicon-align-left"></span> HDD Usage</div>
                    <div class="panel-body">
                        <pre class="api-hdd_usage"></pre>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-8">
                        <div class="panel panel-default">
                            <div class="panel-heading"><span class="glyphicon glyphicon-fire"></span> HDD Temperature</div>
                            <div class="panel-body">
                                <pre class="api-hdd_temp"></pre>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="panel panel-default">
                            <div class="panel-heading"><span class="glyphicon glyphicon-signal"></span> LAN</div>
                            <div class="panel-body">
                                <pre class="api-lan"></pre>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="panel panel-default">
                    <div class="panel-heading"><span class="glyphicon glyphicon-stats"></span> Top</div>
                    <div class="panel-body">
                        <pre class="api-top"></pre>
                    </div>
                </div>
            </div>

            <div class="col-md-5">
                <div class="panel panel-default">
                    <div class="panel-heading"><span class="glyphicon glyphicon-info-sign"></span> Sysinfo</div>
                    <div class="panel-body">
                        <pre class="api-sysinfo"></pre>
                    </div>
                </div>
                <div class="panel panel-default">
                    <div class="panel-heading"><span class="glyphicon glyphicon-ok"></span> Test</div>
                    <div class="panel-body">
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                        exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                        reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
                        occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-12">
                <pre class="api-uptime"></pre>
            </div>
        </div>
    </div>

    <script src="js/jquery.min.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="js/sprintf.min.js"></script>
    <script src="js/stat.js"></script>
  </body>
</html>
