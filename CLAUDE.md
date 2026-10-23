# Plainsight Menu Commands: working rules for Claude

An Obsidian plugin (Mac only, `isDesktopOnly: true`) that turns items in Obsidian's macOS menu bar, above all Apple Intelligence's Edit › Writing Tools, into commands that can have hotkeys. It clicks the item through System Events with `osascript`. Part of the Plainsight family; it works with or without Plainsight. The plugin id is `plainsight-menu-commands`, and the repo is `obsidian-plainsight-menu-commands`.

## Keep README.md up to date

`README.md` is the public description. **Any change visible to the user must update it in the same commit**: features, settings (the **Settings** table must match `src/settings.ts`), command names, and the AppleScript shown under "What runs", which must match `CLICK_SCRIPT` in `src/menu-items.ts` exactly. Never describe something that isn't built.

## Workflow

- **Branch per feature**: `git checkout -b feature/<name>` from `main`. Merge only when Magnus says so.
- Before every commit, run `npx vitest run` and `npm run build` (strict `tsc`), and both must pass.
- To try a change, run `npm run deploy`, then Magnus reloads Obsidian (Cmd+R). Say clearly what has and hasn't been seen running in Obsidian.

## Hard rules

- **Never put note content in the repo.** Tests, docs and commit messages use invented examples only.
- **Menu names travel as `osascript` arguments, never pasted into script text**, so no name can change what the script does.
- **The scripts touch only Obsidian's own menus** (found by its bundle id `md.obsidian`) and never read notes.
- **Never intercept other plugins' transactions or keys.** Everything lives in this plugin's own commands.

## Code layout

- `src/menu-items.ts` is pure TypeScript and **must not import `obsidian`**, because tests run in Node: the Writing Tools list, parsing, command ids and names, the scripts, and error classification.
- `src/menu-runner.ts` runs `osascript` (Node's `child_process`, loaded on use).
- `src/internals.ts` holds every undocumented Obsidian API. Read defensively, and degrade rather than throw.
