# InkShelf — Personal Manga Library

A dark-themed, local-first manga library web app. Built with plain HTML, CSS, and JavaScript — no build step, server, or account required.

## Live site: publish with GitHub Pages

1. Create a new GitHub repository named `inkshelf`. For GitHub Pages on GitHub Free, make it **Public**.
2. Download and unzip this repository ZIP on your Mac.
3. In your GitHub repository, select **Add file → Upload files**. Upload all the **files inside** the unzipped folder (`index.html`, `app.js`, `styles.css`, `.nojekyll`, and `README.md`), not the ZIP itself. Keep `index.html` at the repository root (not in a nested folder). You may need to show hidden files (Command+Shift+Period in Finder) to see `.nojekyll`; it is optional.
4. Commit the upload to the `main` branch.
5. In the repository's **Settings → Pages**, choose **Deploy from a branch**, select `main`, choose `/(root)`, and Save.
6. Open `https://YOUR-USERNAME.github.io/inkshelf/` when Pages finishes publishing. You can find the published URL in **Settings → Pages**.

If you choose a different repository name, replace `inkshelf` in the URL with that name.

## What the website does

- Add, edit, delete, favorite, search, sort, and filter manga
- Track chapter progress, ratings, and reading statuses
- Dashboard with manga stats and reading history
- Create custom collections
- Discover manga metadata using AniList or MyAnimeList (through unofficial public endpoints; availability may change)
- Import a MyAnimeList manga-list XML / XML.GZ export
- Export and import InkShelf JSON backups
- Mobile and desktop friendly

## IMPORTANT: Your library is not stored in GitHub

The *website files* are publicly hosted by GitHub Pages. The *manga collection* is saved in each browser's `localStorage`, not in this repository or GitHub servers.

- Your collection is not publicly displayed to other GitHub visitors.
- A different phone, computer, browser, or browser profile has separate data. Nothing syncs automatically.
- Publishing the website at a new URL starts with an empty library, even if you already used InkShelf locally. Before switching, **export a JSON backup** from the old InkShelf under Settings; then **import** it at the GitHub Pages URL.
- Clearing website data can delete the browser's local copy, so export a JSON backup regularly and keep it somewhere safe (for example, your Mac and an external drive).

## Data sources & limitations

New-title searches require internet. AniList is queried using its public catalog; MAL data is queried through unofficial providers. Those third-party services may fail, block cross-origin requests, or change without notice. The manual library tracker and backups will still work. No automatic MAL account syncing is included.

## Local development

Open `index.html` in a modern browser; all three core files must remain together. Alternatively, use a local static server such as `python3 -m http.server 8000` and open `http://localhost:8000`.

## Files

- `index.html` — page entry point
- `styles.css` — dark styling and responsive design
- `app.js` — library, manga search, collections, backups, and MAL import
- `.nojekyll` — disables Jekyll processing on GitHub Pages
- `README.md` — setup guide
