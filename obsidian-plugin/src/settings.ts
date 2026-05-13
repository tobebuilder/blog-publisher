import {App, PluginSettingTab, Setting} from "obsidian";
import BlogPublisherPlugin from "./main";

export interface BlogPublisherSettings {
	apiUrl: string;
	apiToken: string;
}

export const DEFAULT_SETTINGS: BlogPublisherSettings = {
	apiUrl: 'http://localhost:3000',
	apiToken: ''
}

export class BlogPublisherSettingTab extends PluginSettingTab {
	plugin: BlogPublisherPlugin;

	constructor(app: App, plugin: BlogPublisherPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('API URL')
			.setDesc('博客系统的 API 地址，例如 http://localhost:3000')
			.addText(text => text
				.setPlaceholder('Enter API URL')
				.setValue(this.plugin.settings.apiUrl)
				.onChange(async (value) => {
					this.plugin.settings.apiUrl = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('API Token')
			.setDesc('发布文章所需的鉴权 Token，与博客后端的 BLOG_API_TOKEN 保持一致')
			.addText(text => text
				.setPlaceholder('Enter API Token')
				.setValue(this.plugin.settings.apiToken)
				.onChange(async (value) => {
					this.plugin.settings.apiToken = value;
					await this.plugin.saveSettings();
				}));
	}
}
