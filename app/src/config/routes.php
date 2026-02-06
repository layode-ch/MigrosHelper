<?php

use MigrosHelper\Controllers\AppController;
use Slim\App;

return function (App $app) {
	$app->get("/", [AppController::class, "showHome"]);
};