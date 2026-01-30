<?php

use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Slim\App;

return function (App $app) {
	$app->get("/", function(RequestInterface $req, ResponseInterface $resp){
		$body = $resp->getBody();
		$body->write("Hello world");
		return $resp->withBody($body);
	});
};