
# COMPONENTS

> a document and description of the components, their configs, and dependencies

## Overview

1. What is a Component
2. How are Components combined
3. Configuring a Component
4. Which Component to use, and when
5. Current List of Components
6. Planned List of Component

## --

## 1. What is a Component
- using svelte
- intended to be used in the LayoutGrid
- has configured width, height, events, props, dependents

## 2. How are Components combined
- using LayoutGrid and dependents
- some components are higher orders of lower level components

## 3. Configuring a Component

## 4. Which Component to use, and when

## 5. Current List of Components

### Low Order Components

- `SelectList` - for fetching/listing data and triggering actions when an entry is selected
- `ItemList` - for listing, adding, removing simple data, and specifying events when clicked.
- `DataGrid` - for listing, adding, removing complex tabular data with reactivity
- `Pdf` - for viewing Pdf files in a panel
- `Toolbar` - for generally extending configurability of a panel. contains and extrapolates options to be modified
- `Slider` - (rough) for reactive updating use in `Toolbar` or other cases
- `VideoPlayer` - for viewing video files
- `ImageGallery` - for viewing image files
- `Timer` - a simple countdown timer, with controls
- `Clock`
- `CommandBar`
- `TagBar`
- `Profile`

### High Order Components

- `Session`
- `Files`
-

### (Svelte) Directives

- `clock`
- `linker`
- `fileList`
- `commandLine`
- `profileEdit`

### Stores

- `filesWritable`
- `historyWritable` (for user Session events)
- `registeredActions`

### Global Functions (in Stores)

- `fileList` - pulls list of files with search params from '/api/file/search'
- `_fetch` - wrapper for pure-json calls to localhost using `fetch`

## 6. Planned List of Component







