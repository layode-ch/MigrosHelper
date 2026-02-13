<?php
// Serve static files directly when using PHP built-in server
if (php_sapi_name() === 'cli-server') {
    $path = __DIR__ . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (is_file($path)) {
        return false;
    }
}

require_once __DIR__."/../vendor/autoload.php";

use DI\Container;
use Psr\Container\ContainerInterface;
use Psr\Http\Message\ResponseFactoryInterface;
use Slim\Factory\AppFactory;
use Slim\Psr7\Factory\ResponseFactory;
use Slim\Views\PhpRenderer;

session_start();

// Create Container using PHP-DI
$container = new Container();

// Add custom response factory
$container->set(ResponseFactoryInterface::class, function (ContainerInterface $container) {
    return new ResponseFactory();
});


$container->set(PhpRenderer::class, function (ContainerInterface $container) {
    $renderer =  new PhpRenderer(__DIR__."/../views");
    $renderer->setLayout("layout.php");
    return $renderer;
});

// Configure the application via container
$app = AppFactory::createFromContainer($container);

$errorMiddleware = $app->addErrorMiddleware(true, true, true);

(require_once __DIR__."/../src/config/routes.php")($app);

$app->run();
