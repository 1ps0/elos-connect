<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { writable, get } from 'svelte/store';
  import * as network from "./lib/apis/network.js";
  import * as proxy from "./lib/apis/proxy.js";
  
  const dispatch = createEventDispatcher();
  
  export let config = {
    dataSourcePath: null,
    dataStore: null,
    dataKey: null,
    readonly: false,
    deletable: false,
    transform: (x) => x,
    buttons: [],
    buttonName: "Add",
    inputEvent: null,
    titleKey: null,
  };
  
  let queue = [];
  
  function didClick(e) {
    dispatch("didClick", e );
  }
  
  export const didClickButton = (item) => {
    return Promise.resolve(item)
      .then(_item => _item.prop.action(_item))
      .catch(proxy.print.failure_item_list)
  }
  
  function close(e) {
    return Promise.resolve(e)
      .then(proxy.print.status_close_remove_queue)
      .then(_e => _e.detail)
      .then(queue.remove)
      .catch(proxy.print.failure_close_remove_queue)
  }
  
  onMount(() => {
    proxy.print.success_ItemList_mounted();
  });
  
  const squashItem = (title, length) => {
    return (title || "").slice(0,length);
  }
  
  </script>
  
  <section class="log-body">
    {#if queue}
      <ul class="list-none m-0 p-0">
        {#if !config.readonly}
          <li>
            <div id="add-btn" class="flex">
              <form on:submit|preventDefault={config.inputEvent} class="flex">
                <input type="text" id="task-input" placeholder="" class="border border-gray-300 p-1">
                <button type="submit" class="ml-2 px-3 py-1 bg-blue-500 text-white font-semibold">{config.buttonName}</button>
              </form>
            </div>
          </li>
        {/if}
        {#each queue as _item (_item.name) }
          <li
            class="item cursor-pointer relative p-3 bg-gray-200 text-sm transition duration-200 w-full"
            on:click={() => didClick(_item)}
          >
            <slot name="itemTitle">
              {#if config.titleKey}
                {squashItem(`${_item.tag || ""}${_item.tag ? ": " : " "}${_item[config.titleKey]}`, 50)}
              {:else if config.transform}
                {config.transform(_item)}
              {/if}
            </slot>
            {#each config.buttons as prop (prop.name)}
              <div
                class="item-button inline-block ml-2 p-1 border border-black text-xs"
                on:click|preventDefault={(e) => didClickButton({
                  item: _item,
                  button: prop
                })}
              >
                {prop.icon(_item)}
              </div>
            {/each}
  
            {#if _item.deletable || config.deletable}
              <span class="close absolute top-0 right-0 p-3" name={_item.name} on:click={close}><i class="fas fa-times"></i></span>
            {/if}
          </li>
        {:else}
          <li class="p-3">No Data</li>
        {/each}
      </ul>
    {:else}
      <p class="p-3">No Data</p>
    {/if}
  </section>
  
  