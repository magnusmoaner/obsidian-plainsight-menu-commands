import { MenuSettings, WRITING_TOOLS } from "./menu-items";

/* The settings as stored in data.json, without Obsidian, so tests can run in Node. */

export type Settings = MenuSettings;

export const DEFAULT_SETTINGS: Settings = {
  writingToolsCommands: true,
  writingTools: [...WRITING_TOOLS],
  menuCommands: "",
};

const KNOWN = new Set<string>(Object.keys(DEFAULT_SETTINGS));

/**
 * A stored data.json, field by field: a value of the wrong type falls back
 * to its default. Keys this version doesn't know are returned as `extra`
 * and written back unchanged, so saving never drops something a newer
 * version on another device stored.
 */
export function parseSettings(raw: unknown): { settings: Settings; extra: Record<string, unknown> } {
  const data = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const settings: Settings = { ...DEFAULT_SETTINGS, writingTools: [...DEFAULT_SETTINGS.writingTools] };
  const extra: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (!KNOWN.has(key)) {
      extra[key] = value;
      continue;
    }
    const name = key as keyof Settings;
    const fallback = DEFAULT_SETTINGS[name];
    const valid = Array.isArray(fallback)
      ? Array.isArray(value) && value.every((item) => typeof item === "string")
      : typeof value === typeof fallback;
    if (valid) (settings as unknown as Record<string, unknown>)[name] = value;
  }
  return { settings, extra };
}

/** What to write to data.json. */
export function serializeSettings(settings: Settings, extra: Record<string, unknown>): Record<string, unknown> {
  return { ...extra, ...settings };
}
