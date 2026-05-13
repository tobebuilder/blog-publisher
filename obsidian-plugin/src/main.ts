import { MarkdownView, Notice, Plugin, requestUrl } from 'obsidian';
import { BlogPublisherSettings, BlogPublisherSettingTab, DEFAULT_SETTINGS } from "./settings";

export default class BlogPublisherPlugin extends Plugin {
	settings: BlogPublisherSettings;

	async onload() {
		await this.loadSettings();

		// Add a ribbon icon
		this.addRibbonIcon('paper-plane', 'Publish to Blog', async (evt: MouseEvent) => {
			await this.publishCurrentNote();
		});

		// Add a command to palette
		this.addCommand({
			id: 'publish-to-blog',
			name: 'Publish/Update to Blog',
			checkCallback: (checking: boolean) => {
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					if (!checking) {
						this.publishCurrentNote();
					}
					return true;
				}
				return false;
			}
		});

		this.addSettingTab(new BlogPublisherSettingTab(this.app, this));
	}

	async publishCurrentNote() {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) {
			new Notice('No active Markdown view found.');
			return;
		}

		const file = view.file;
		if (!file) {
			new Notice('No active file found.');
			return;
		}

		new Notice('Publishing to blog...');

		try {
			// Read the entire file content
			const fullContent = await this.app.vault.read(file);
			
			// Process frontmatter
			let currentSlug = '';
			let title = file.basename;
			let tags: string[] = [];

			await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
				if (frontmatter.slug) {
					currentSlug = frontmatter.slug;
				}
				if (frontmatter.title) {
					title = frontmatter.title;
				} else {
					frontmatter.title = title; // Default to filename
				}
				if (frontmatter.tags) {
					tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [frontmatter.tags];
				}
			});

			const isUpdate = !!currentSlug;
			const apiUrl = this.settings.apiUrl.replace(/\/$/, '');
			const endpoint = isUpdate ? `${apiUrl}/api/posts/${currentSlug}` : `${apiUrl}/api/posts`;
			const method = isUpdate ? 'PUT' : 'POST';

			// Remove frontmatter from the content being sent if needed, but the backend API handles it gracefully if we just send the markdown.
			// Actually, PRD says the backend expects the raw Markdown content. Our backend uses gray-matter which strips frontmatter automatically.
			const payload = {
				title: title,
				content: fullContent, // Backend handles parsing
				tags: tags,
				status: 'published'
			};

			const response = await requestUrl({
				url: endpoint,
				method: method,
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${this.settings.apiToken}`
				},
				body: JSON.stringify(payload)
			});

			if (response.status >= 200 && response.status < 300) {
				const data = response.json;
				
				// Update frontmatter with the returned/existing slug and status
				await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
					frontmatter.slug = data.slug;
					frontmatter.status = 'published';
					if (!frontmatter.platforms) {
						frontmatter.platforms = {};
					}
					frontmatter.platforms.blog = true;
				});

				new Notice(`Successfully ${isUpdate ? 'updated' : 'published'} article!`);
			} else {
				new Notice(`Failed to publish: ${response.status} ${response.text}`);
				console.error('Publish error:', response);
			}

		} catch (error: any) {
			new Notice(`Error: ${error.message}`);
			console.error('Plugin Error:', error);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
