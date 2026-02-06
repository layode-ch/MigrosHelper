<?php
namespace MigrosHelper\Controllers;

use Psr\Http\Message\RequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;

class AppController extends BaseController {
	public function showHome(Request $req, Response $resp): Response {
		return $this->render("home.php", [], $resp);
	}
}