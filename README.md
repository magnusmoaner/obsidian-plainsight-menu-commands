# Plainsight Menu Commands

Give Apple Intelligence's **Writing Tools**, and any other item in Obsidian's menu bar, a hotkey. Mac only.

Obsidian's hotkeys only work for commands, and Writing Tools aren't commands: they live in macOS's **Edit → Writing Tools** menu. This plugin turns them, and any other menu item you name, into ordinary Obsidian commands. You can then give them a hotkey in Obsidian, run them from the command palette, or put them on a toolbar button (for example with Editing Toolbar).

It works with or without [Plainsight](https://github.com/magnusmoaner/obsidian-plainsight), and is part of the same family of plugins (see below).

**Needs:** a Mac, and Obsidian 1.7.2 or later. Writing Tools also need Apple Intelligence turned on.

> **Status:** early. Not yet in the Community Plugins directory.

## Writing Tools

With **Writing Tools commands** turned on (the default), you get one command for each item in Edit → Writing Tools:

*Show Writing Tools · Proofread · Rewrite · Make Friendly · Make Professional · Make Concise · Summarize · Create Key Points · Make List · Make Table · Compose…*

Select some text in a note and run one: it does exactly what picking it from the menu would. Each one can be switched off in the settings, so the command palette only lists the ones you use.

Writing Tools need a Mac with Apple Intelligence turned on, and appear only while you're typing in a note. The commands find them by their English names, so they work when macOS is set to English; in another language, add them under **Other menu items** with the names your menu shows.

## Other menu items

Any other menu item can become a command too. List them in the settings, one per line, from the menu bar down with `>` between the levels:

```
Window > Minimize
```

Names must match the menu exactly, in your Mac's language.

## Hotkeys

The commands have no keys until you give them one: open **Settings → Hotkeys** and search for *Plainsight Menu Commands*, or click **Set hotkeys** in the plugin's settings. A hotkey stays with its menu item for as long as the item is listed.

## Permissions

The plugin picks the menu item for you, just as if you'd clicked it. macOS allows that only once Obsidian has two permissions, both in **System Settings → Privacy & Security**:

- **Automation**: Obsidian may control *System Events*. macOS asks the first time.
- **Accessibility**: Obsidian is turned on. If it isn't listed, add it with `+`.

**Check** in the plugin's settings asks macOS for what's missing and opens the right page of System Settings. If a command can't run, a message says why: a missing permission, a greyed-out item (Writing Tools need selected text), or a name that isn't in the menu.

<details>
<summary>What runs when you use a menu command</summary>

The plugin starts macOS's `osascript` with this AppleScript, passing the menu path as arguments (`Edit`, `Writing Tools`, `Summarize`). It finds Obsidian by its app ID (`md.obsidian`) and opens each menu on the way by name, as a mouse would (macOS checks what's selected as a menu opens, which Writing Tools relies on). It reports a greyed-out item instead of clicking it, and otherwise clicks the item. If anything goes wrong partway, it presses Escape to close the menus:

```applescript
on run argv
  tell application "System Events"
    tell (first application process whose bundle identifier is "md.obsidian")
      set target to menu bar item (item 1 of argv) of menu bar 1
      try
        click target
        repeat with i from 2 to count of argv
          set target to menu item (item i of argv) of menu 1 of target
          if i < (count of argv) then click target
        end repeat
        if not (enabled of target) then error "Greyed out" number 7001
        click target
      on error message number code
        key code 53
        error message number code
      end try
    end tell
  end tell
end run
```

**Check** runs a script that only reads the name of the first menu in Obsidian's menu bar, which needs the same two permissions but clicks nothing. Neither script touches any other app or reads your notes. Both are in [`src/menu-items.ts`](src/menu-items.ts).

</details>

## Settings

| Setting | Default | What it does |
| --- | --- | --- |
| Permissions | — | **Check** asks macOS for the two permissions and opens System Settings where one is missing |
| ***Writing Tools*** | | |
| Writing Tools commands | On | A command for each item in Edit → Writing Tools |
| Show Writing Tools, Proofread, Rewrite, … Compose | On | Each Writing Tools command (greyed out while Writing Tools commands are off) |
| ***Other menu items*** | | |
| Menu items | (none) | More menu items to make commands of, one per line, e.g. `Window > Minimize` |
| ***Hotkeys*** | | |
| Set hotkeys | — | Opens Settings → Hotkeys, showing only this plugin's commands |

## The Plainsight family

This plugin is part of a small family of Obsidian plugins with the same aim: Obsidian that feels calm and works like a proper note editor.

| Plugin | What it does |
| --- | --- |
| **[Plainsight](https://github.com/magnusmoaner/obsidian-plainsight)** | An editor without Markdown syntax, and a two-column notes sidebar |
| **Plainsight Menu Commands** (this one) | Hotkeys for Apple Intelligence's Writing Tools and any other menu item, on a Mac |

Each works on its own; together they fit.

## Installation

The plugin isn't in the Community Plugins directory yet, and there are no releases yet either. To install it by hand:

1. Build it (see Development below), which produces `main.js`; `manifest.json` is in the repo.
2. Copy those two files to `<your vault>/.obsidian/plugins/plainsight-menu-commands/`.
3. In Obsidian, go to Settings → Community plugins, reload, and enable **Plainsight Menu Commands**.

Once releases are published, [BRAT](https://github.com/TfTHacker/obsidian42-brat) can install it straight from GitHub (add `magnusmoaner/obsidian-plainsight-menu-commands`).

## Development

```
npm install
npm run build     # type-check and bundle
npx vitest run    # tests
npm run deploy    # build and copy into a vault
```

`npm run deploy` copies the build to the folder in `OBSIDIAN_PLUGIN_DIR`, set in the environment or in a git-ignored `.env.local`:

```
OBSIDIAN_PLUGIN_DIR=/path/to/vault/.obsidian/plugins/plainsight-menu-commands
```

## License

[MIT](LICENSE)
