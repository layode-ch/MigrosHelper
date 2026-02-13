<?php

use MigrosHelper\Controllers\AppController;
use MigrosHelper\Controllers\ChatController;
use Slim\App;

return function (App $app) {
	$app->get("/", [AppController::class, "showHome"]);
	$app->post("/api/chat", [ChatController::class, "chat"]);
	$app->post("/api/search-group", [ChatController::class, "searchGroup"]);
};
