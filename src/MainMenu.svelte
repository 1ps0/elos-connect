<script>
import { onMount, createEventDispatcher } from 'svelte';

export let items = {};
let visibleItems = [];
$: visibleItems = Object.values(items);
// $: console.log('menu items', visibleItems);

const dispatch = createEventDispatcher();

function showTab(e) {
  var name = e.currentTarget.href.split('#')[1];
  var i, tabcontent, tablinks, el;

  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  el = document.getElementById(name);
  if (!el) return;

  el.style.display = "block";
  e.currentTarget.className += " active";
}

onMount(async () => {
  console.log('MainMenu mounted');
  // document.getElementsByClassName("defaultOpen")[0].click();
});

// <MarkdownEditor />
</script>

<section>

  <!-- <nav id="menu" class="tab"> -->
  <ul id="menu" >
    {#each visibleItems as item}
      <li class="tab">
        <button class="tablinks" id="#{item.target}" on:click={() => dispatch("menuToggle", item.target)}>
          {item.name}
        </button>
      </li>
    {/each}
  </ul>

</section>

<style>

.remove {
  cursor: pointer;
  position: absolute;
  right: 5px;
  top: 3px;
}

/*
  Menu Tabs
  https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_search_menu
*/

section {
  font-family: Arial, Helvetica, sans-serif;
}

* {
  box-sizing: border-box;
}

/* Create a column layout with Flexbox */
.row {
  display: flex;
}

/* Left column (menu) */
.left {
  flex: 35%;
  padding: 15px 0;
}

.left h2 {
  padding-left: 8px;
}

/* Right column (page content) */
.right {
  flex: 65%;
  padding: 15px;
}

/* Style the navigation menu */
#menu {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

/* Style the navigation links */
#menu li a {
  padding: 12px;
  text-decoration: none;
  color: black;
  display: block
}

#menu li a:hover {
  background-color: #eee;
}

/*
  Menu Vis
  https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_vertical_tabs
*/

/* Style the tab */
.tab {
  float: left;
  border: 1px solid #ccc;
  background-color: #f1f1f1;
  width: 10vw;
  height: 90%;
}

/* Style the buttons inside the tab */
.tab li {
  display: block;
  background-color: inherit;
  color: black;
  padding: 22px 16px;
  width: 100%;
  border: none;
  outline: none;
  text-align: left;
  cursor: pointer;
  transition: 0.3s;
  font-size: 17px;
}

/* Change background color of lis on hover */
.tab li:hover {
  background-color: #ddd;
}

/* Create an active/current "tab li" class */
.tab li.active {
  background-color: #ccc;
}

</style>