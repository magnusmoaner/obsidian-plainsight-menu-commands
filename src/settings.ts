import { App, PluginSettingTab, Setting } from "obsidian";
import { openHotkeys } from "./internals";
import { explainMenuFailure, WRITING_TOOLS } from "./menu-items";
import { canUseMenus, checkMenuAccess, openPrivacySettings } from "./menu-runner";
import type MenuCommandsPlugin from "./main";

export class MenuCommandsSettingTab extends PluginSettingTab {
  /** The last permission check's outcome, kept while the tab re-renders. */
  private access = "";

  constructor(app: App, private plugin: MenuCommandsPlugin) {
    super(app, plugin);
  }

  display(): void {
    this.containerEl.empty();
    const { settings } = this.plugin;

    if (!canUseMenus()) {
      new Setting(this.containerEl)
        .setName("Mac only")
        .setDesc("Menu commands use macOS's menu bar, so they're available only in Obsidian on a Mac.");
      return;
    }

    const access = new Setting(this.containerEl)
      .setName("Permissions")
      .setDesc(
        this.access ||
          "Menu commands pick the menu item for you, which macOS allows only once Obsidian may control " +
            "System Events (Automation) and is turned on under Accessibility. Check asks macOS for what's " +
            "missing and opens the right page of System Settings."
      )
      .addButton((button) =>
        button.setButtonText("Check").onClick(async () => {
          button.setDisabled(true);
          access.setDesc("Checking… answer macOS if it asks.");
          const { failure, detail } = await checkMenuAccess();
          if (!failure) {
            this.access = "Both permissions are on. Menu commands are ready.";
          } else if (failure === "automation" || failure === "accessibility") {
            this.access = `${explainMenuFailure(failure, null)} System Settings is open there now; press Check again afterwards.`;
            openPrivacySettings(failure);
          } else {
            this.access = explainMenuFailure(failure, null, detail);
          }
          this.display();
        })
      );

    new Setting(this.containerEl).setName("Writing Tools").setHeading();

    new Setting(this.containerEl)
      .setName("Writing Tools commands")
      .setDesc(
        "Apple Intelligence's Edit › Writing Tools as commands: Summarize, Proofread and the rest. " +
          "Select text in a note, then run one. Needs Apple Intelligence turned on."
      )
      .addToggle((toggle) =>
        toggle.setValue(settings.writingToolsCommands).onChange(async (value) => {
          await this.plugin.updateSettings({ writingToolsCommands: value });
          this.display();
        })
      );
    const toolsOff = !settings.writingToolsCommands;
    for (const item of WRITING_TOOLS) {
      new Setting(this.containerEl)
        .setName(item)
        .setDisabled(toolsOff)
        .addToggle((toggle) =>
          toggle
            .setValue(settings.writingTools.includes(item))
            .setDisabled(toolsOff)
            .onChange(async (value) => {
              const chosen = this.plugin.settings.writingTools.filter((name) => name !== item);
              await this.plugin.updateSettings({ writingTools: value ? [...chosen, item] : chosen });
            })
        );
    }

    new Setting(this.containerEl).setName("Other menu items").setHeading();

    new Setting(this.containerEl)
      .setName("Menu items")
      .setDesc(
        "One per line, from the menu bar down, with > between the levels, e.g. Window > Minimize. " +
          "Names must match the menu exactly, in your Mac's language."
      )
      .addTextArea((text) => {
        text.setPlaceholder("Window > Minimize").setValue(settings.menuCommands);
        text.inputEl.rows = 4;
        text.onChange(async (value) => {
          await this.plugin.updateSettings({ menuCommands: value });
        });
      });

    new Setting(this.containerEl).setName("Hotkeys").setHeading();

    new Setting(this.containerEl)
      .setName("Give the commands hotkeys")
      .setDesc("The commands have no keys until you give them one.")
      .addButton((button) =>
        button.setButtonText("Set hotkeys").onClick(() => openHotkeys(this.app, "Plainsight Menu Commands"))
      );
  }
}
