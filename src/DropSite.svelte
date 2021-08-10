<script>

function dropHandler(ev) {
    console.log('File(s) dropped');

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    if (ev.dataTransfer.items) {
        for (var item in ev.dataTransfer.items) {
            if (item.kind === 'file') {
                console.log('file.name = ', file);
            }
        }
    }
}

function dragOverHandler(ev) {
    console.log('File(s) in drop zone');

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
}


</script>

<section>
    <div id="drop_zone" on:drop={dropHandler} on:dragover={dragOverHandler}>
        <p>Drag one or more files to this Drop Zone ...</p>
    </div>

</section>

<style>
#drop_zone {
  border: 5px solid blue;
  width:  200px;
  height: 100px;
}

</style>
