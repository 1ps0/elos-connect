## eLOS Connect

eLOS Connect is a browser plugin extension of the eLOS web project.

### Overview

1. Installing
2. What is it?
3. Current Features
4. Design

## Installation

> NOTE: Currently only Firefox is supported.
> However, manifest v2 standards make Chrome support an approachable feature.

### Dev Install
1. `npm install rollup && npm install && npm run dev`
2. In browser bar, navigate to: [about:debugging](about:debugging#/runtime/this-firefox)
3. Find and click the button labeled `Load Temporary Add-on...`
4. Navigate to `public/manifest.json` and submit the selected file.
5. Use 'Ctrl+e' on mac to open the sidebar, or open history,et al. and change the tab to `eLOS Connect`

## What is it?

eLOS is short for the e-Learning Operating System; a toolchain for handling, organizing, exporting, formatting and otherwise using your content.

Content is ambiguous on purpose, with a primary goal of organizing and bringing together material from continuous learning type sources. This is hard, and so narrow by necessity.

eLOS Connect is the most directly usable aspect of the eLOS platform. It is designed to integrate with the daily use scenarios; such as saving a video, stashing an article, saving links to your personal library.

eLOS Connect is a toolkit itself. The goal is to bring all of your needs as close and easy as possible.

Adding new features is a little bit of development work, and well documented and templated. The main display panels live in

### Current Features

> Plugin Only

- Copy Selected Tabs to Clipboard (format: `title,url`)
- Darkmode current site (applies to all sites)
- HackerNews default darkmode
- Track, Control, Access actively playing tabs
- CLI for a motley of combined operations

> eLOS Server/API integrated

- Download Video (ytdl to cache a video/song/ locally)
- tag location/url and save to server

## Design

Currently, `elos-connect` is figuring out the path to its core purpose.
In the mean-time, the structure is as below:

1. eLOS connect browser plugin
2. eLOS panel UI (referred to as `connect`)
3. eLOS unified api/processing server

The eLOS server can:

- be run on the local machine
- facilitate filesystem-level operations
- run processing jobs
- integrate with sqlite via json schema/interface

The eLOS connect UI can:

- provide a faux control environment
- uses a panel system to contain function widgets
- provide a sidebar space for the eLOS UI
- provide deeper access to the data and capabilities available to the browser
- directly interact with a website in a controlled manner
- enable the eLOS UI to monitor the status of active elements in a website

---

The eLOS connect plugin is the current entrypoint and focus driving the project.
The plugin should be able to connect and interact with the server

## Features

1. Send activetab's url to localhost:3000/api/location/add via POST with format

```json
{
  "title": "...",
  "url": "...",
  "tag": "..."
}
```

2. On plugin activation, display a menu with tags available, click tag to save with that term.

3. A "add tag" box at the top of 2.

4. A button to copy URLs of all selected tabs

5. A button to render page as Firefox Reader state, then save the current page as PDF (in lieu of article content preprocessing).

6. IN PROGRESS: send reader rendered html to local server for handling.
