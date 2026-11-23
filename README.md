# My Calendar

A personal calendar PWA. Events are saved on the device (localStorage). Works offline once installed.

## Publish on GitHub Pages
1. Create a new public repo, e.g. `my-calendar`.
2. Upload every file in this folder to the repo root (keep the `icons/` folder).
3. Repo > Settings > Pages > Source: "Deploy from a branch" > Branch: `main` / `/ (root)` > Save.
4. Open `https://<your-username>.github.io/my-calendar/` on your phone.

## Install on phone
- Android (Chrome): menu (⋮) > Install app / Add to Home screen.
- iPhone (Safari): Share > Add to Home Screen.

## Updating
Edit files, then change `CACHE = 'my-calendar-v2'` in `sw.js` to `v2`, `v3`, ... and push.
