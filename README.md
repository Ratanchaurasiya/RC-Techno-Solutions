# RC Techno Solution website

## Project location

The website source is in:

`C:\Users\ratan\Downloads\RC-Tech-Solution-main\RC-Tech-Solution-main`

The outer `RC-Tech-Solution-main` folder contains the downloaded media files; the inner folder above contains the HTML pages, stylesheets, scripts, and site assets.

## Project setup

This is a static, multi-page HTML/CSS/JavaScript website. There is no `package.json`, framework build, or configured npm scripts. `package-lock.json` is present, but without its matching `package.json` it does not define install or run commands. No dependencies need installing to view the site.

## Start the website locally

From the project folder, start Python's built-in static server:

```powershell
cd "C:\Users\ratan\Downloads\RC-Tech-Solution-main\RC-Tech-Solution-main"
python -m http.server 8000
```

Then open [http://localhost:8000/](http://localhost:8000/) for the home page. Other pages are available as files, for example `/about.html`, `/services.html`, and `/contact.html`. Stop the server with `Ctrl+C`.

If Python is unavailable, serve this folder using any existing static-file server. Opening the HTML files directly may prevent some browser features, modules, or local asset paths from working as intended.

## Testing

There are no configured `npm run build`, `npm run lint`, `npm run test`, Playwright, or Cypress scripts in this project. Do not run npm install or infer framework-specific commands. Use the static server above for manual browser checks. The legacy script at `tools/check_html.py` contains a hard-coded path to another machine and is not a usable project check in its current form.

See [RESPONSIVE_AUDIT.md](RESPONSIVE_AUDIT.md) for the page inventory, audit scope, viewport checklist, and verification status.
