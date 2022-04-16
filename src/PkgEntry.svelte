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
</style>
