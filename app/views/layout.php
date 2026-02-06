<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Migros Helper</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css">
    <link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet" type="text/css" />
    <link href="https://cdn.jsdelivr.net/npm/daisyui@5/themes.css" rel="stylesheet" type="text/css" />
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body class="min-h-screen flex flex-col">
	<header class="sticky top-0 z-1">
        <nav class="navbar bg-base-100 shadow-sm">
            <a class="btn btn-ghost text-xl" href="/">Mirgos Helper</a>
        </nav>
    </header>
	<main class="m-auto relative flex flex-1">
        <?= $content ?>
    </main>
	<footer class="footer sm:footer-horizontal bg-neutral text-neutral-content p-10">
		<nav>
			<h6 class="footer-title">Authors</h6>
			<a class="link link-hover" href="https://github.com/NoodraTV">Nicolas Bieri</a>
			<a class="link link-hover" href="https://github.com/Ethjuro">Ethan Raphael</a>
			<a class="link link-hover" href="https://github.com/layode-ch">Joao Victor Pereira Vaz</a>
		</nav>
		<nav>
			<h6 class="footer-title">Frontend</h6>
			<a class="link link-hover" href="https://daisyui.com/">DaisyUI</a>
			<a class="link link-hover" href="https://tailwindcss.com/">Tailwind</a>
		</nav>
		<nav>
			<h6 class="footer-title">Backend</h6>
			<a class="link link-hover" href="https://www.slimframework.com/">Slim Framework V4</a>
			<a class="link link-hover" href="https://github.com/Seldaek/monolog">Monolog</a>
		</nav>
		<nav>
			<h6 class="footer-title">Legal</h6>
			<a class="link link-hover" href="https://creativecommons.org/licenses/by-nc/4.0/">Licence CC BY-NC V4.0</a>
		</nav>
	</footer>
</body>
</html>