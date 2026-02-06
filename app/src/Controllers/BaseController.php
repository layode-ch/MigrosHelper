<?php 
namespace MigrosHelper\Controllers;

use MigrosHelper\Enums\HTTPStatus;
use Psr\Http\Message\ResponseFactoryInterface as ResponseFactory;
use Psr\Http\Message\ResponseInterface as Response;
use Slim\Psr7\Request;
use Slim\Views\PhpRenderer;

/**
 * Base controller providing common response and request handling utilities
 */
abstract class BaseController {

	/**
	 * Response factory used to create HTTP responses
	 */
	protected ResponseFactory $respFact;
	protected PhpRenderer $renderer;

	/**
	 * Creates a controller instance with a response factory
	 *
	 * @param ResponseFactory $respFact
	 */
	public function __construct(ResponseFactory $respFact, PhpRenderer $renderer) {
		$this->respFact = $respFact;
		$this->renderer = $renderer;
	}

	/**
	 * Allows to send a JSON response with a given HTTP status
	 *
	 * @param mixed $data
	 * @param HTTPStatus $status
	 * @return Response
	 */
	protected function sendJSON(mixed $data, HTTPStatus $status = HTTPStatus::OK): Response {
		$resp = $this->respFact->createResponse($status->value);
		$body = $resp->getBody();
		$body->write(json_encode($data));

		return $resp->withHeader('Content-Type', 'application/json');
	}

	/**
	 * Allows to retrieve and decode the JSON body of a request
	 *
	 * @param Request $request
	 * @return array
	 */
	protected function getBody(Request $request): array {
		$body = json_decode($request->getBody()->getContents(), true);

		if ($body === null)
			$body = [];

		return $body;
	}

	/**
	 * Allows to send a JSON response containing validation or processing errors
	 *
	 * @param array $errors
	 * @param HTTPStatus $status
	 * @return Response
	 */
	protected function sendErrors(array $errors, HTTPStatus $status = HTTPStatus::BAD_REQUEST): Response {
		return $this->sendJSON($errors, $status);
	}

	protected function render(string $viewFile, array $viewData, ?Response $response = null) : Response {
        return $this->renderer->render($response ?? $this->respFact->createResponse(), $viewFile, $viewData);
    }
}
