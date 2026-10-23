import { Notice, Plugin } from "obsidian";
import { explainMenuFailure, menuCommandId, menuCommandName, menuPaths, MenuPath } from "./menu-items";
import { canUseMenus, clickMenu } from "./menu-runner";
import { parseSettings, serializeSettings, Settings } from "./settings-data";
import { MenuCommandsSettingTab } from "./settings";

export default class MenuCommandsPlugin extends Plugin {
  settings!: Settings;
  /** Keys in data.json this version doesn't know, written back unchanged. */
  private settingsExtra: Record<string, unknown> = {};
  /** Commands made from menu items, as registered now. */
  private commandIds: string[] = [];

  async onload(): Promise<void> {
    const { settings, extra } = parseSettings(await this.loadData());
    this.settings = settings;
    this.settingsExtra = extra;
    this.addSettingTab(new MenuCommandsSettingTab(this.app, this));
    this.refreshCommands();
  }

  async updateSettings(patch: Partial<Settings>): Promise<void> {
    this.settings = { ...this.settings, ...patch };
    await this.saveData(serializeSettings(this.settings, this.settingsExtra));
    this.refreshCommands();
  }

  /** One command per menu item the settings name, registered again when they change. */
  private refreshCommands(): void {
    if (!canUseMenus()) return;
    for (const id of this.commandIds) this.removeCommand(id);
    this.commandIds = [];
    for (const path of menuPaths(this.settings)) {
      const id = menuCommandId(path);
      this.addCommand({ id, name: menuCommandName(path), callback: () => void this.runMenuItem(path) });
      this.commandIds.push(id);
    }
  }

  private async runMenuItem(path: MenuPath): Promise<void> {
    // Back in the note first: the command palette may have taken the focus,
    // and Writing Tools acts on the selection in whatever has it.
    this.app.workspace.activeEditor?.editor?.focus();
    const { failure, detail } = await clickMenu(path);
    if (failure) new Notice(explainMenuFailure(failure, path, detail), 8000);
  }
}
