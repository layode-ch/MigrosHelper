<div class="min-h-screen bg-base-200 flex items-center justify-center">
  <div class="card w-full max-w-sm shadow-2xl bg-base-100">
    <div class="card-body">
      <h2 class="card-title justify-center text-2xl"><?= htmlspecialchars($_SESSION["TEXTS"]['login_text']); ?></h2>

      <form method="post">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Email</span>
          </label>
          <input type="email" placeholder="email@example.com" class="input input-bordered" required/>
        </div>

        <div class="form-control mt-4">
          <label class="label">
            <span class="label-text"><?= htmlspecialchars($_SESSION["TEXTS"]['password_text']); ?></span>
          </label>
          <input type="password" placeholder="••••••••" class="input input-bordered" required/>
        </div>

        <div class="form-control mt-6">
          <button class="btn btn-primary"><?= htmlspecialchars($_SESSION["TEXTS"]['login_text']); ?></button>
        </div>
      </form>
      <p class="text-center text-sm mt-4">
        <?= htmlspecialchars($_SESSION["TEXTS"]['no_account_text']); ?> 
        <a href="/register" class="link link-primary"><?= htmlspecialchars($_SESSION["TEXTS"]['createAccout_text']); ?></a>
      </p>
      <?php foreach ($errors as $error): ?>
        <div role="alert" class="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span><?= $error ?></span>
        </div>
      <?php endforeach?>
    </div>
  </div>
</div>
