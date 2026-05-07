# Playground

A scratch space for trying out new ideas with Claude Code on the web (mobile-friendly).

## How to use

When you have a new idea, ask Claude to create a folder under `projects/` for it:

```
projects/
  <idea-name>/
    README.md       # what the idea is, how to run it
    ...             # whatever language/stack fits
```

One folder per idea. Keep them small and self-contained. If something graduates
into a real project, move it to its own repo.

## Conventions

- Folder names: lowercase-with-hyphens (e.g. `projects/markdown-parser`)
- Each project has its own `README.md` with a one-line description and run
  instructions
- Each project owns its own dependencies (don't share venvs or `node_modules`
  across projects)
- It's fine to delete an idea once you're done with it
