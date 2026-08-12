---
title: Why I rebuilt this portfolio

description: A dated website, a deployment that blew up, and a bruised ego. Three reasons, only two of which are technically defensible.

date: '2026-08-11'

tags:
  - laravel
  - nuxt
  - deploy
---

Let me save you some time: of the three reasons I threw my previous portfolio in the bin, two are technical and would survive a meeting. The third is a tantrum. I shall begin with the respectable ones, so as to preserve a shred of dignity before the confession.

## The old site was dated — and it spoke for someone I am no longer

My previous portfolio was a time capsule. Not in the charming "look how vintage" sense, but in the grandmother's attic sense: full of things that made sense once and now merely gather dust and second-hand embarrassment.

The problem was not the technology itself — it was the mismatch. I have been buried in Go and Rust, reading about concurrency and memory management as though that were a healthy hobby, while my website carried on swearing blind that my eternal love was a PHP monolith. Nothing against it: PHP paid my bills with a loyalty no recruiter has ever displayed. But keeping a portfolio that describes who you have stopped being is the digital equivalent of using a profile photo from eight years ago (and yes, mine is exactly three years old, so I still have five to spare). Technically it is you. But everyone gets a fright when you finally meet in person.

There was also the small matter that a portfolio exists, in theory, to represent me. If it represents a professional who no longer exists, it has stopped being a portfolio and become an obituary.

## Nuxt, because I am lazy and at least honest about it

I love Nuxt. Not in a rational, measured way, with benchmarks and a comparison spreadsheet. I love it in the problematic way: without sufficient technical justification and with a willingness to argue about it. I simply like it. Everything sits exactly where it ought to.

The choice was therefore obvious, even by my standards. What I want from a portfolio is to write a `.md` file, push it, and go to bed. That is genuinely all. I do not want a three-node Kubernetes cluster with a service mesh and distributed observability to serve six pages and a contact form that receives two emails a month — one of which is me, checking whether the contact form works (sometimes both of them).

Nuxt delivers precisely that well-adjusted laziness: content in files, a build that does not force me to negotiate with a bundler, and a deployment that finishes before I lose interest. Choosing anything more sophisticated would be building a refinery to fry an egg.

## The deployment blew up and I, being an emotionally balanced individual, rewrote everything

Now for the tantrum.

A pipeline broke. A deployment failed for one of those reasons that exist only in production and evaporate the moment you try to reproduce them locally. The mature response would have been to open the log, find the error, fix it in twenty minutes, and get on with my life.

That is not what happened. I looked at that log, took a deep breath, and concluded — with all the serenity of a well-adjusted adult — that the problem was not the error. It was the entire project. And the architecture. And the decisions made by my past self. And, quite possibly, the software industry as a whole. So I deleted the lot and started again.

Yes, I am dramatic. Rewriting a project because a deployment failed is rather like moving city because the kitchen tap started dripping. In my defence, however: the tap had been dripping for months, and I had gone off the city anyway (and non-ironically, that last part is not merely a metaphor).

## What came out of it

A website that loads quickly, that I update by writing Markdown like a civilised person, and that describes the professional I am today rather than the one I was when I still believed in sprint estimates.

The real gain, though, was something else, and it is faintly embarrassing to admit: I enjoyed myself. I had spent far too long locked inside client projects, where every decision requires justification, approval, and a card on the board. Here I chose the technologies because I felt like it, wrote the copy in whatever tone I fancied, and had to convince precisely nobody of anything.

If a broken deployment was the price of remembering that programming can be fun, it was cheap. I am still cross about it, but it was cheap.
