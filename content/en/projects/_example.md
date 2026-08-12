---
# Template — copy it, rename it (e.g. `my-project.md`) and fill it in.
# Files starting with `_` are never indexed, so this file never reaches the site.
# Create the matching file in `content/pt/projects/` using the SAME filename:
# the filename becomes the URL, so `my-project.md` is served at
# `/projects/my-project` and `/pt/projects/my-project`.

# Card and page heading.
title: Example Project

# Company, client or "Personal project".
association: Personal project

# Optional — live demo or repository. Delete if there is nothing to link to.
link: https://github.com/your-username/example-project

# Optional — put the file in `public/images/projects/` and reference it from the root.
# Delete this line to render the card without a cover image.
image: /images/projects/example-project.webp

# Always quote dates. Format: "YYYY-MM".
startDate: '2025-01'

# Delete this line entirely while the project is active — it gets an "Active" badge.
endDate: '2025-08'

# Set to true to show this project on the home page. Keep the list short.
featured: true
---

Everything below the front matter is the project page body, written in Markdown.

## The problem

Describe what was broken or missing, and who it affected.

## The approach

Explain the decisions that mattered and the trade-offs you accepted.

- Architecture choices worth defending
- Constraints you designed around
- What you would revisit with hindsight

## The outcome

Close with results. Numbers land harder than adjectives: latency, cost, adoption,
build times, error rates.
