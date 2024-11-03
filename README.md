## eLOS Connect
eLOS Connect is a browser extension that brings eLOS functionality directly to your browser. It provides a command-line interface (CLI) in the address bar, allowing you to interact with the eLOS server, manage tabs, and perform various operations.

## Installation
Download and install the eLOS Connect extension from the releases page.
Restart your browser.

## Usage
Command-Line Interface (CLI)
eLOS Connect provides a CLI in the address bar for quick access to its features. Here are some examples of commands you can use:

- Dark Mode Toggle: Toggle dark mode for the current website.
`- darkmode`

Reader Mode Toggle: Toggle reader mode for the current website.
`- readermode`

Gather Tabs: Move all tabs matching a query to a new window.
`- gather <query> [--type <tab_type>] [--tag <tag>]`

Replace <query> with a domain name, a tag, a title pattern, or use all to gather all tabs. Use --type to filter by tab type (e.g., video, audio, article). Add a --tag to apply a specific tag to the gathered tabs.

List Playing Tabs: Display a list of actively playing tabs and navigate to the selected one.

`- playing [--history]`
Use --history to display the history of playing tabs.

Analyze Page Content: Analyze the current page for legal content.
`- analyze`

Unload Tab/Window: Close a tab or a window by its ID.
`- unload <tab_id|window_id>`

Set Window/Tab Title: Set the title of the active window or tab.
`- title <new_title>`

For more information on available commands and their usage, refer to the omnibox.js file.

## eLOS Server Integration
eLOS Connect integrates with the eLOS server to provide additional functionality, such as saving articles and videos to your personal library. To use these features, you'll need to have the eLOS server running on your local machine or have access to a remote instance.

## Design
eLOS Connect is designed to provide a seamless and intuitive user experience, bringing the power of eLOS directly to your browser. The extension is structured as follows:

- eLOS Connect Browser Extension: The main entry point for user interaction.
- eLOS Panel UI: Provides a sidebar space for the eLOS UI and displays function widgets for deeper access to browser capabilities.
- eLOS Unified API/Processing Server: Handles filesystem-level operations, runs processing jobs, and integrates with the eLOS database.

## Features
- Command-line interface (CLI) for quick access to features.
- Dark mode toggle for websites.
- Reader mode toggle for websites.
- Gather tabs based on queries and move them to a new window.
- List actively playing tabs and navigate to the selected one.
- Analyze the current page for legal content.
- Unload tabs and windows.
- Set the title of the active window or tab.

Integrate with the eLOS server for saving articles and videos to your personal library (requires eLOS server running locally or remotely).

## Roadmap
- Add support for more eLOS server features, such as tagging and exporting content.
- Integrate with the eLOS UI for a more seamless user experience.
- Improve the command-line interface with auto-completion and suggestions.
- Add support for more browsers, such as Chrome and Edge.
- Enhance the eLOS Connect extension with user-defined scripts and customizations.

## Contributing
Contributions are welcome! If you'd like to contribute to eLOS Connect, please follow these guidelines:

- Fork the repository.
- Create a new branch for your changes.
- Make your changes and commit them with descriptive commit messages.
- Push your changes to your fork.
- Open a pull request against the main branch, describing the changes you've made and their purpose.
- For more information on contributing, refer to the Contributing file.

## License
eLOS Connect is licensed under the MIT License.
