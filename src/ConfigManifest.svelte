

<script>

export const omniboxKeyword = (action) => {};

export const commandKeys = (action) => {};

export const defaultPanels = (action) => {};

export const contentScriptsEnabled = (action) => {};
export const mediaPlayerControl = (action) => {
    return {
        playPause:, 
        toggleLoop:, 
        restart:
    }[action](action.slice(1));
} 
export const doTextFind = (action) => {};
export const doTextExtraction = (action) => {};

export const setLogLevel = (action) => {};

export const enablePanelsOptions = (action) => {};

export const enableSidebar = (action) => {};


export const settings = {
    omniboxKeyword: omniboxKeyword,
    commandKeys: commandKeys,
    defaultPanels: defaultPanels,
    contentScriptsEnabled: contentScriptsEnabled,
    mediaPlayerControl: mediaPlayerControl,
    doTextFind: doTextFind,
    doTextExtraction: doTextExtraction,
    setLogLevel: setLogLevel,
    enablePanelsOptions: enablePanelsOptions,
    enableSidebar: enableSidebar,
}

</script>

<!---
index.html rendering a manifest.json for local saving, based on configured values;
- omnibox keyword
- command keys
- default panels
- content scripts enabled: [media player control (play/pause, loop, restart), find, text extraction,]
- log level
- enable/disable panels in options
- enable/disable sidebar
- 
-->

<section>
    <ul>
        {#each Object.entries(settings) as setting}
            <li><div><p>{`${setting[0]}`}<p></div></li>
        {/each}
    </ul>

</section>
