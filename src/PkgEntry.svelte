<script>
import { onMount } from 'svelte';

export let pkg = {};
$: console.log('PkgEntry: ', pkg);

let title = "placeholder title"; //pkg["content"]["title"];
let attributed = pkg["metadata.teachers"];
let keywords = pkg["metadata.skills.keywords"];

async function fetch_(uri, cb) {
  const ret = await fetch(uri);
  cb(await ret.json());
};

async function fetch_pkg_index() {
  let loc = `/api/pkg?name=${pkg["name"]}`;

  await fetch_(loc, (ret) => {
    console.log(ret);
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

</script>

<div class="container {package_type()}">
  <div class="main">
    <h2>{title}</h2>
    <span class="tag-box">{pkg["metadata.format"]}</span>
     |
    <span class="tag-box">{pkg["metadata.content.variation"]}</span>
  </div>
  <div class="editor">
    <!-- {editor} -->
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

.container p {
  font-size: 0.7em;
  text-transform: uppercase;
  /*text-decoration: underline;*/
}

</style>
