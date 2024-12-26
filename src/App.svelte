<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import LayoutGrid from "./LayoutGrid.svelte";
  import * as layout from "./lib/apis/layout.js";

  import { panelTypes, layoutConfig } from "./config/panels.js";
  import * as proxy from "./lib/apis/proxy.js";
  import { stores } from "./lib/stores.js"
  import { components } from "./components.js";
  // import ActionButton from './ActionButton.svelte';

  const genId = () => "_" + Math.random().toString(36).substr(2, 9)

  let objects = {};
  const panelItems = writable([]);
  // const panelItems = [];

  // Modify store subscription to avoid Promise issues
  panelItems.subscribe(items => {
    if (items && items.length) {
      // Handle only actual array data
      const safeItems = items.map(item => ({
        ...item,
        // Remove any potential Promise properties
        props: item.props ? safeClone(item.props) : {}
      }));
      stores.layoutItems.set(safeItems);
    }
  });
  
  const _addToWritable = (item) => {
    return Promise.resolve(item)
      .then(_item => {
          panelItems.push(_item)
          return panelItems;
      })
      .catch(proxy.print.failure_add_writable)
  }
  const addPanel = (panelTarget, options={}) => {
    // TODO render icons into menupanelItems
    // TODO render source/dataStore props into actual stores
    if (!panelTypes.hasOwnProperty(panelTarget)) {
      console.log("MISSING PANEL", panelTarget)
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
      // .then(positionItem)  // Keep commented positioning logic
      .then(item => layout.findSpace(item, $panelItems, layoutConfig.columnCount))
      .then(position => {
        const newItem = { ...item, ...position };
        // Use safe cloning for store updates while preserving structure
        const safeItem = {
          ...newItem,
          props: newItem.props ? safeClone(newItem.props) : {},
          // Preserve future extension points
          _pendingUpdates: [],
          _lifecycleHooks: {}
        };
        panelItems.update(items => [...items, safeItem]);
        return newItem;
      })
      .then(_addToWritable)  // Preserve the writable store pattern
      .catch(proxy.print.failure_panels_add_item);
    };

  function hydrateParams(item) {
    return Promise.resolve(item)
      .then(_item => {
        if (!components.hasOwnProperty(_item.componentName)) {
          proxy.print.failure_hydrate_missing_component(_item.componentName);
          return _item; // Continue with invalid component rather than reject
        }

        // Handle dataStore if specified
        if (_item.props?.dataStore && stores[_item.props.dataStore]) {
          _item.props.dataStore = stores[_item.props.dataStore];
          
          // Update existing instance if it exists
          if (_item.target in objects && objects[_item.target]) {
            objects[_item.target].$set("dataStore", _item.props.dataStore);
          }
        }

        // Handle event binding
        if (_item.event) {
          // Map event callback string to function
          if (_item.event.callback === "togglePanel") {
            _item.event.callback = togglePanel;
          }
          
          // Bind to existing instance
          if (_item.target in objects && objects[_item.target]) {
            objects[_item.target].$on(_item.event.name, _item.event.callback);
          }
        }

        return _item;
      })
      .catch(proxy.print.failure_hydrate_params);
  }

  const _removeFromWritable = (item) => {
    return Promise.resolve(item)
      .then(_item => panelItems.findIndex(value => value.target === _item.target))
      .then(_itemIndex => _itemIndex > -1 ? panelItems.splice(_itemIndex, 1) : panelItems)
      .catch(proxy.print.failure_add_writable)
  }

  const removePanel = (item) => {
    return Promise.resolve(item)
      // .then(_removeFromWritable)
      .then(_item => {
        panelItems.update(items => items.filter(i => i.target !== _item.target));
        return _item;
      })
      .then(items => items.length > 0 ? delete objects[item] : null)
      .catch(proxy.print.failure_panels_remove_item)
  };

  const positionItem = (item) => {
    return Promise.resolve(item)
      .then(_item => layout.findSpace(_item, panelItems, layoutConfig.columnCount)
        .then(_layout => ({..._item, ..._layout}))
      )
      .then(proxy.print.status_position_item)
      .catch(proxy.print.failure_panels_position_item)
  }

  const togglePanel = (e) => {
    return Promise.resolve(e)
      .then(_e => _e?.detail?.name)
      .then(_togglePanel)
      .catch(proxy.print.failure_toggle_panel_1)
  }

  const _togglePanel = (itemName) => {
    return Promise.resolve(itemName)
      .then(_itemName => panelItems.filter(value => value.target === _itemName))
      .then(_layout => {
        if (_layout.length > 0)
          return removePanel(itemName)
        else
          return addPanel(itemName)
      })
      .catch(proxy.print.failure_toggle_panel_2)
  }

  const onAdd = (val) => {
    return Promise.resolve(val)
      .then(_val => _val.detail)
      .then(item => {
        if (item && item.event && item.target in objects) {
          objects[item.target].$on(item.event.name, item.event.callback)
        }
      })
  };

  onMount(async () => {
    // proxy.print.success_App_mounted()

    // let defaults = (browser.runtime.getManifest() || {}).panels.default;
    let panels = Promise.resolve([]);
    // defaults ||
    ([
      "panel-mainmenu",
      "panel-actionmenu",
      // "panel-web-players",
      // "panel-playlists",
      // "panel-config",
    ]).forEach((name) => {
      panels = panels
        .then((prev) => addPanel(name))
        .catch(proxy.print.failure_panel)
    })
    return await panels.catch(proxy.print.failure_panels)
  })

</script>

<main >
  <header>
    <!-- <TopBar/> -->
  </header>

  <section>
    <LayoutGrid
      panelItems={$panelItems}
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
