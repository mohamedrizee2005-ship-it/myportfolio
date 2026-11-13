# Mohamed Rizny — Personal Portfolio

My personal portfolio as a Management & Information Technology undergraduate at the University of Kelaniya, working towards a career in AI engineering.

**Live website:** [riznysm.me](https://riznysm.me/)

## What is included

- An introduction, education details, and contact links.
- GainTrack Strength, a personal Android workout project.
- HallSync, a completed university group project using Java and MySQL.
- Skills, certifications, and a learning badge with issuer links.
- Responsive layouts, light and dark themes, keyboard-accessible image previews, and an email-draft form.

GainTrack's current preview is an illustrative recreation, labelled on the page. HallSync images are actual application screenshots. The contact form opens the visitor's email app; it does not send or store messages on a server.

## Run locally

No build step or package installation is required. From the repository folder, run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Project structure

```text
index.html                 Page content and metadata
assets/css/style.css       Responsive styles and theme colours
assets/js/script.js        Navigation, theme, image dialog, and email draft
assets/images/             Portrait, project previews, and credentials
assets/fonts/              Self-hosted IBM Plex Sans and its OFL licence
.github/workflows/         Existing mobile Lighthouse audit
CNAME                      Custom domain configuration
```

## Updating the website

Edit the relevant files, check desktop and narrow mobile layouts, and commit and push to `main`. GitHub Pages publishes the repository using the existing custom domain configuration. Keep `CNAME` unchanged unless you intend to change the domain.

The website uses semantic HTML, CSS, and vanilla JavaScript. IBM Plex Sans is self-hosted under the [SIL Open Font License](assets/fonts/OFL.txt); there are no runtime framework or font-service dependencies.
