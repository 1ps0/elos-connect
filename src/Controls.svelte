<script>

export let elements = {};

export let folders;

let active = false;
$: active;

function foo(node, bar) {
    // the node has been mounted in the DOM

    return {
        update(bar) {
            // the value of `bar` has changed
        },

        destroy() {
            // the node has been removed from the DOM
        }
    };
}

</script>

<div class="main">

<table class="panel">
    <tr class="row">
        <form action="/api/scan/whitelist">
            <td class="name">
            <td class="single">
                <input type="file" bind:files={folders} directory id="addFolder" name="filename" text="Add Folder">
                <input type="submit">
            </td>
        </form>
    </tr>
    <tr class="row">
        <td class="single">
            <form action="/api/scan/">
                <input type="file" id="scanFolders" name="filename" text="Scan Folders">
                <input type="submit">
            </form>
        </td>
    </tr>
    <tr class="row">
        <td class="single">
            <div class:active={active} >STOP SCAN</div>
        </td>
    </tr>
    <tr class="row">
        <td class="single">
        </td>
    </tr>
    <tr class="row">
        <td class="single">
        </td>
    </tr>
    <tr class="row">
        <td class="single">
        </td>
    </tr>
    <tr class="row">
        <td class="single">
        </td>
    </tr>
    <tr class="row">
        <td class="single">
        </td>
    </tr>
    <tr class="row">
        <td class="single">
        </td>
    </tr>
</table>

</div>

<style>

.active {
    border: 1px solid red;
}

.inactive {
    border: 1px solid black;
}

</style>
