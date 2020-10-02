<script>
import jquery from './jquery-1.11.1.js';
import { onMount } from 'svelte';

export let pkg = {};

let title = "";//pkg["content"]["title"];
let attributed = pkg["metadata.teachers"];
let keywords = pkg["metadata.skills.keywords"];

function fetch__(uri) {
  axios.get("/api/counts", { params: {} } )
    .then((response) => {
      console.log(response);
      data.status = response;
    })
    .catch((error) => {
      console.log("got error on fetch", error);
    });

}
async function fetch_(uri, cb) {
  const ret = await fetch(uri);
  cb(await ret.json());
};

async function fetch_pkg_index() {
  let loc = `/api/pkg/`;

  await fetch_(loc, (ret) => {
    pkg = ret;
  });
}

onMount(() => {
  fetch_pkg_index();
});

function package_type() {
  if (pkg["metadata.content.type"] == "course-1") {
    return "small";
  } else if (pkg["metadata.content.type"] == "course-2") {
    return "large";
  }
}

function toggleVisible() {
  if (jquery(".expandable").is(':visible')) {
    jquery(".expandable").hide();
    jquery(".visibility-button").text('show expanded');
  } else {
    jquery(".expandable").show();
    jquery(".visibility-button").text('hide expanded');
  }
}
toggleVisible();

function loadPkg() {

}

function openInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}


</script>

<div class="container {package_type()}">
  <div class="main">
    <h2>{title}</h2>
    <span on:click={openInNewTab} class="tag-box open-link">Open in New Window</span><br/>
    <span class="tag-box">{pkg["metadata.format"]}</span><br/>
    <h4>{attributed}</h4>
    <span class="tag-box">{pkg["metadata.content.variation"]}</span><br/><br/>
    {#each keywords as keyword}
      <span class="tag-box">{keyword}</span>
    {/each}
    <hr/>
    <span class="visibility-button" on:click={toggleVisible}>show expanded</span>
  </div>
  <div class="expandable">
    <hr/>
    <textarea id="content" bind:value={pkg}></textarea>
    <!-- <p>{pkg.content.summary}</p>

    {#each pkg.content.sections as section (section.header)}
      <h3>{section.title}</h3>
      <table>
        <tr>
          <th>type</th>
          <th>count</th>
          <th>duration</th>
        </tr>
        {#each (section["summary.content_type"] || []) as content_type}
        <tr>
          <td>{content_type}</td>
          <td>{section["summary.count"][content_type]}</td>
          <td>{section["summary.duration"][content_type]}</td>
        </tr>
        {/each}
      </table>
    {/each}
-->
   </div>
</div>

<style>

.visibility-button {
  border-radius: 2px;
  border: 1px solid black;
  padding: 0.5em;
  margin: 0.5em;
}

.small {
  border: 1px solid black;
}

.large {
  border: 1px dotted blue;
}

.tag-box {
  border-radius: 2px;
  border: 1px solid black;
  box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
  padding: 0.5em;
  margin: 0.25em;
  /*flex: 1;*/
  /*display: flex;*/
  font-size: 0.7em;
  color: blue;
  background-color: #EEE;
}

.container {
  width: 97%;
  /*border: 1px solid #aaa;*/
  border-radius: 2px;
  box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
  padding: 1em;
  margin: 0 0 1em 0;
  /*display: flex;*/
  flex-direction: column;
}

.container h2,span {
  text-transform: uppercase;
  font-size: 1em;
  color: #ff3e00;
}

.container p,table {
  font-size: 0.7em;
  text-transform: uppercase;
  /*text-decoration: underline;*/
}

</style>
