import { App } from "obsidian";

/**
 * Undocumented Obsidian APIs, isolated so they're easy to audit. Each one
 * degrades to doing nothing when the shape isn't what we expect.
 */

type Loose = Record<string, unknown> | null | undefined;

function openSettingsTab(app: App, tabId: string): void {
  const setting = (app as unknown as { setting?: { open(): void; openTabById(id: string): void } }).setting;
  setting?.open();
  setting?.openTabById(tabId);
}

/** Settings → Hotkeys, already searched for `query`. */
export function openHotkeys(app: App, query: string): void {
  openSettingsTab(app, "hotkeys");
  const tab = (app as unknown as { setting?: { activeTab?: Loose } }).setting?.activeTab;
  const search = tab?.searchComponent as { setValue?(value: string): void } | undefined;
  const update = tab?.updateHotkeyVisibility;
  if (typeof search?.setValue !== "function" || typeof update !== "function") return;
  search.setValue(query);
  update.call(tab);
}
