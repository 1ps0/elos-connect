<script>



// export let identifier;
// export let title;
export let tags;

</script>


    <!-- <span id="title">{title}</span> -->
    <ul>
    {#each tags as tag}
        <li id="tag">
            {tag}
        </li>
    {/each}
    </ul>

<style>

.box {
    width: 10px;
    border: 1px solid #aaa;
    border-radius: 2px;
    box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
    padding: 1em;
    margin: 0 0 1em 0;
}

.tagset {
    font-size: 13px;
    font-family: courier;
    border-width: 3px;
}

#tag {
    font-size:11px;
    font-family: helvetica;
    border-width: 2px;
}

#title {
    font-size: 15px;
    font-family: courier;
    text-decoration: underline;
}

</style>
