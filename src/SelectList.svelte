<script>
import { onMount, createEventDispatcher } from 'svelte';

const dispatch = createEventDispatcher();

export let eventName = "menuToggle";
export let items = {};
let visibleItems = [];
$: visibleItems = Object.values(items);
$: console.log('menu items', items, eventName, visibleItems);


function toggle(e) {
  // console.log('clicked toggle --', e.target.name, e);
  e.target.active |= true;
  dispatch(eventName, e.target.name);
}

onMount(async () => {
  console.log('MainMenu mounted');
  console.log('menu items', items, eventName, visibleItems);
});

// <MarkdownEditor />
</script>

<section>

  <div class="pill-nav">
    {#each items as item}
      <a
        name={item}
        href="#{item}"
        on:click|preventDefault={toggle}
        class="{active}"
      >
        {item.slice(10).toUpperCase()}
      </a>
    {/each}
  </div>
</section>

<style>
/* Style the links inside the pill navigation menu */
.pill-nav a {
  display: block;
  color: black;
  text-align: center;
  padding: 14px;
  text-decoration: none;
  font-size: 17px;
  border-radius: 5px;
}

/* Change the color of links on mouse-over */
.pill-nav a:hover {
  background-color: #ddd;
  color: black;
}

/* Add a color to the active/current link */
.pill-nav a.active {
  background-color: dodgerblue;
  color: white;
}

/*
  Menu Tabs
  https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_search_menu
*/

section {
  font-family: Arial, Helvetica, sans-serif;
}

</style>