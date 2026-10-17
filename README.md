# AVIL lab website

Website of the Advanced Visual Intelligence Lab (AVIL), Department of Electronic
Engineering, Yeungnam University. Live at <https://avil-lab.github.io/avil/>.

Plain Jekyll, built by GitHub Pages from the `main` branch. No build step is needed:
edit a data file, commit, push, and the site rebuilds in about a minute.

## Editing content

Nearly everything lives in `_data/`:

| File | What it holds |
|---|---|
| `lab.yml` | Lab name, about text, purpose, RLRC text, contact details, partners |
| `professor.yml` | PI profile and career timeline |
| `members.yml` | Current members (photo in `assets/img/members/`) |
| `alumni.yml` | Alumni with graduation month and next position |
| `publications.yml` | All publications, newest first |
| `events.yml` | News items, one per photo (drives News, Gallery, home news) |
| `projects.yml` | Current and past projects |
| `equipment.yml` | Lab equipment |
| `conferences.yml`, `journals.yml` | Copied from Selim Sarowar's homepage (s-elim.github.io) |

Bilingual fields come in `en` / `ko` pairs; the header switch chooses which one shows.

## Local preview

```bash
bundle install
bundle exec jekyll serve   # http://localhost:4000/avil/
```

The content was migrated from the lab's previous Wix site on 2026-10-17.
