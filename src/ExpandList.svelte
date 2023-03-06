<script>
import { createEventDispatcher, onMount } from 'svelte';

const dispatch = createEventDispatcher();

export let readonly = false;
export let dataStore = null;
export let dataKey = null;
export let transform = null;
// export let sort = (x) = x;

let queue = null;
// $: console.log('queue -->', queue, dataStore);

// TODO make this part of the toolbar
// TODO make 'add' trigger a writable

export let buttonName = null;
export let inputEvent = null;
export let titleKey = null;
$: readonly = !buttonName || !inputEvent;
$: titleKey;


// when we click a list item
function didClick(e) {
  console.log('did click', e);
  dispatch("didClick", e );
}

// below code borrowed from https://www.w3schools.com/howto/howto_js_todolist.asp


function close(e) {
  // TODO remove from queue
  var div = e.target.parentElement;
  div.style.display = "none";
  dispatch('removed', e);
}

onMount(async () => {
  print.success_ExpandList_mounted();

  if (dataStore) {
    // print.success_dataStore_mounted(); in ExpandList");
    dataStore.subscribe((val) => {
      if (val) {
        console.log("ExpandList update", dataKey, val);
        if (dataKey) {
          queue = val[dataKey];
        } else {
          queue = val;
        }
      }
    });
  }
});

</script>


<div>
  {#if queue}
    {#each Object.values(queue) as _item}
      <p
        class="item"
      >
        {#if titleKey && titleKey in _item && _item[titleKey] !== null}
            <span>{_item[titleKey]}</span>
        {/if}
        {#if _item  && _item.length > 0 && transform}
          <table>
          {#each transform(_item) as _i}
            <tr>
              <td>{_i.name}</td>
              {#each _i.data as v}
                <p>{v}</p>
              {/each}
              <td>at: {_i.at}</td>
            </tr>
          {/each}
          </table>
        {/if}
      </p>
    {:else}
      <p>No Data ({queue.length}, {_item.prototype})</p>
    {/each}
  {:else}
    <p>No List Given ({queue})</p>
  {/if}
</div>

<style>

/* Include the padding and border in an element's total width and height */
* {
  box-sizing: border-box;
}

/* Remove margins and padding from the list */
div {
  margin: 2px;
  padding: 2px;
}

/* Style the list items */
div p {
  cursor: pointer;
  position: relative;
  padding: 12px;
  border: 1px solid black;
  border-radius: 5px;
  list-style-type: none;
  background: #eee;
  font-size: 16px;
  transition: 0.2s;
  width: 100%;

  /* make the list items unselectable */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Set all odd list items to a different color (zebra-stripes) */
div p:nth-child(odd) {
  background: #f9f9f9;
}

/* Darker background-color on hover */
div p:hover {
  background: #ddd;
}

/* When clicked on, add a background color and strike out text
div p.checked {
  background: #888;
  color: #fff;
  text-decoration: line-through;
}

/* Add a "checked" mark when clicked on
div p.checked::before {
  content: '';
  position: relative;
  border-color: #fff;
  border-style: solid;
  border-width: 0 2px 2px 0;
  top: 10px;
  left: 16px;
  transform: rotate(45deg);
  height: 15px;
  width: 7px;
}*/

</style>
