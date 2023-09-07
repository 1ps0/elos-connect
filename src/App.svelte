
<script>
  import { onMount } from 'svelte';
  // import { derived } from 'svelte/store';
  import LayoutGrid from "./LayoutGrid.svelte";
  import * as layout from "./lib/apis/layout.js";

  import { panelTypes, layoutConfig } from "./config/panels.js";
  import * as proxy from "./lib/apis/proxy.js";
  import { stores } from "./lib/stores.js"
  import { components } from "./components.js";
  // import ActionButton from './ActionButton.svelte';

  const genId = () => "_" + Math.random().toString(36).substr(2, 9);

  let objects = {};
  let items = [];
  $: console.log('[ITEMS][App]', items);

  function hydrateParams(item) {
    if (!components.hasOwnProperty(item.componentName)) {
      console.log("MISSING COMPONENT", item.componentName);
    }

    if (item.props !== undefined
        && item.props.dataStore !== undefined
        && item.props.dataStore) {

      item.props.dataStore = stores[item.props.dataStore];

      if (item.target in objects && objects[item.target]) {
        objects[item.target].$set("dataStore", item.props.dataStore);
      }
    }

    if (item.event !== undefined) {
      switch(item.event.callback) {
        case "togglePanel": item.event.callback = togglePanel; break;
      }
      if (item && item.target && item.target in objects && objects[item.target] !== null) {
        objects[item.target].$on(item.event.name, item.event.callback);
      }
    }
    return item;
  }

  const positionItem = (item) => {
    return Promise.resolve(item)
      .then(_item => layout.findSpace(_item, items, layoutConfig.columnCount)
        .then(_layout => ({..._item, ..._layout})))
      .catch(proxy.print.failure_panels_position_item)
  }

  const add = (panelTarget, options={}) => {
    // TODO render icons into menuItems
    // TODO render source/dataStore props into actual stores
    if (!panelTypes.hasOwnProperty(panelTarget)) {
      console.log("MISSING PANEL", panelTarget);
    }
    return Promise.resolve(panelTarget)
      .then(_target => panelTypes[_target])
      .then(_type => ({..._type, ...options}))
      .then(hydrateParams)
      .then(_opts => ({
        w: layoutConfig.columnCount,
        h: 5, // FIXME add default height
        id: genId(),
        ..._opts,
      }))
      .then(layout.makeItem)
      .then(positionItem)
      .then(proxy.print.status_panels_add_item_1)
      .then(_item => [...items, _item])
      .then(proxy.print.status_panels_add_item_2)
      .then(_items => items = _items)
      .catch(proxy.print.failure_panels_add_item)
  };

  const remove = (item) => {
    return Promise.resolve(item)
      .then(_item => items.filter(value => value.target === _item.target))
      .then(proxy.print.status_panels_remove_item_1)
      .then(_items => items = _items)
      .then(_ => items.length > 0 ? delete objects[item] : null)
      .catch(proxy.print.failure_panels_remove_item)
  };

  const togglePanel = (e) => {
    return Promise.resolve(e)
      .then(_e => _e?.detail?.name)
      .then(_togglePanel)
      .catch(proxy.print.failure_toggle_panel_1)
  }

  const _togglePanel = (itemName) => {
    return Promise.resolve(itemName)
      .then(_itemName => items.filter(value => value.target === _itemName))
      .then(proxy.print.status_toggle_panel_2)
      .then(_layout => {
        if (_layout.length > 0)
          remove(itemName);
        else
          add(itemName);
      })
      .catch(proxy.print.failure_toggle_panel_2)
  };

  const onAdd = (val) => {
    let item = val.detail;

    if (item && item.event && item.target in objects) {
      objects[item.target].$on(item.event.name, item.event.callback);
    }
  };

  onMount(async () => {
    proxy.print.success_App_mounted();

    // let defaults = browser.runtime.getManifest().panels.default;
    let panels = Promise.resolve([]);
    [
      "panel-mainmenu",
      // "panel-actionmenu",
      // "panel-web-players",
      // "panel-playlists",
      // "panel-config",
    ].forEach((name) => {
      panels = panels
        .then((prev) => add(name))
        .catch(proxy.print.failure_panel);
    });
    let result = await panels.catch(proxy.print.failure_panels);
    return result;
  });

</script>

<main >
  <header>
    <!-- <TopBar/> -->
  </header>

  <section>
    <LayoutGrid
      bind:items={items}
      cols={layoutConfig.columnCount}
      rowHeight={layoutConfig.rowHeight}
      gap={[layoutConfig.panelGap]}
      let:item 
      let:dataItem
      let:index
    >
    <div>
      <span>
        {item.target.replace("panel-", '').replace('-', ' ')}
        <!-- TODO: buttons
          1. pin
          2. shift up
          3. shift down
          4. close
          5. max/shrink vertical
        -->
        <hr/>
      </span>
      <svelte:component
        id={item.target}
        this={components[item.componentName]}
        bind:this={objects[item.target]}
        on:didMount={onAdd}
        data={item}
        {...item.props}
        {index}
      />
    </div>
    </LayoutGrid>
  </section>
</main>
