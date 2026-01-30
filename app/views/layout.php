<!DOCTYPE html>
<html lang="<?= htmlspecialchars($_SESSION["lang"]); ?>" data-theme="autumn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reely</title>
    <link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet" type="text/css" />
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <link href="https://cdn.jsdelivr.net/npm/daisyui@5/themes.css" rel="stylesheet" type="text/css" />
</head>
<body>
    <header>
        <nav>
            <div class="navbar bg-primary text-primary-content">
                <button class="btn btn-ghost text-xl">Reely</button>
                <div class="flex">
                    <img src="./icons/france.png" alt="FR" class="h-6">
                    <input type="checkbox" class="toggle mx-2" id="toggleLang" onchange="setLang()" />
                    <img src="./icons/united-kingdom.png" alt="EN" class="h-6">
                </div>
            </div>
        </nav>
    </header>
    <main><?= $content ?></main>
    <footer></footer>
</body>
<script>
    console.log(document.cookie);

    if(getCookie("lang") === "en")
        document.querySelector("#toggleLang").checked = true;

    function setLang()
    {
        let checked = document.querySelector("#toggleLang").checked;

        if(checked)
            setCookie("lang","en");
        else
            setCookie("lang","fr");

        console.log(document.cookie);
        
        location.reload();
    }

    function setCookie(name,value) {
        document.cookie = name + "=" + (value || "") + "; path=/";
    }

    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    function eraseCookie(name) {   
        document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
</script>
</html>
