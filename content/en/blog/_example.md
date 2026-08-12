---
# Template — copy it, rename it (e.g. `my-first-post.md`) and fill it in.
# Files starting with `_` are never indexed, so this file never reaches the site.
# Create the matching file in `content/pt/blog/` using the SAME filename:
# the filename becomes the URL, so `my-first-post.md` is served at
# `/blog/my-first-post` and `/pt/blog/my-first-post`.

# Post title, shown on the card and as the page heading.
title: Example Post

# One or two sentences. Used on the card and as the SEO description.
description: A short summary that makes someone decide whether to keep reading.

# Always quote dates, otherwise YAML turns this into a Date object.
# Format: "YYYY-MM-DD". Listings are sorted by this field, newest first.
date: '2025-08-11'

# Optional — rendered as badges. Delete the block if you do not want tags.
tags:
  - nuxt
  - typescript
---

Everything below the front matter is the post body, written in Markdown.

## Start with the point

Open with the thing you want the reader to remember. Save the build-up for later — people skim, and the first paragraph is the only one guaranteed to be read.

## Show the code

```ts
export function greet(name: string): string {
  return `Hello, ${name}`
}
```

## Close with what changed

End with the practical takeaway: what you would do differently, or what the reader should try next.
