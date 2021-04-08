<script>
/*
TODO -
*/

// import HorizontalBar from "svelte-chartjs/src/HorizontalBar.svelte";
import { Chart } from "chart.js";
import { createEventDispatcher, onMount } from 'svelte';
import { linker } from "./lib/linker.js";

const dispatch = createEventDispatcher();

export let dataStore = null;
export let dataKey = null;
export let readonly = false;
export let transform = (x) => x;

export let buttonName = null;
export let inputEvent = null;
export let titleKey = null;
$: readonly = !buttonName || !inputEvent;
$: titleKey;

let queue = null;
let data = null;
let chart = null;
$: {
  if (queue) {
    data = renderData();
    console.log(chart);
    chart.data = data;
    chart.update();
  }
  else {
    // console.log("NO QUEUE", queue, data, dataKey);
  }
};
$: console.log("queue", queue);

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

function renderData() {
  return {
    labels: Object.keys(queue),
    datasets: [{
      label: "",
      data: Object.values(queue).map((x) => x.at.length),
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(255, 205, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(201, 203, 207, 0.2)'
      ],
      borderColor: [
        'rgb(255, 99, 132)',
        'rgb(255, 159, 64)',
        'rgb(255, 205, 86)',
        'rgb(75, 192, 192)',
        'rgb(54, 162, 235)',
        'rgb(153, 102, 255)',
        'rgb(201, 203, 207)'
      ],
      borderWidth: 1
    }]
  }
}

function createChart() {
  let ctx = document.getElementById('chart').getContext('2d');
  return new Chart(ctx, {
    type: 'bar',
    data: renderData(),
    options: {
      scales: { yAxes: [{ ticks: { beginAtZero: true } }] },
      fill: true,
      maintainAspectRatio: false,
      responsive: true,
      indexAxis: 'y',
      elements: { bar: { borderWidth: 2, } },
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: 'Chart.js Horizontal Bar Chart'
        }
      }
    }
  });
}

onMount(async () => {
  console.log('ItemList mounted');

  if (dataStore) {
    console.log("dataStore mounted in ItemList");
    dataStore.subscribe((val) => {
      if (val) {
        console.log("ItemList update", val);
        if (dataKey) {
          queue = val[dataKey];
        } else {
          queue = val;
        }
      }
    });
    chart = createChart();
  }
});

</script>


<section class="log-body">
  <canvas id="chart" width="400" height="400"></canvas>
<!--   {#if data}
    <svelte:component
      this={HorizontalBar}
      data={data}
      options={options}
    />
  {/if} -->
</section>

<style>
</style>
