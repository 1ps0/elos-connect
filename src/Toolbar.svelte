
<style>
</style>

<section>

{#each option as opt}

{/each}

</section>
<script>

import { onMount } from 'svelte';

export let item = {};
// $: item;
// $: console.log('item', item, interpret_item(item));

export let options = {};
$: options = interpret_item(item);
// $: console.log('Toolbar -> ', item, options);

const interpret_item = (item) => {
    /*
    examples:
    Files: (move next/etc options)

    */

    return {};
};

onMount(async () => {
  print.success_Toolbar_mounted();

  // addNewRow();
});


// TODO accumulating TOOLBAR type functions here

function filterFunction() {
  // Declare variables
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");

  // Loop through all table rows, and hide those who don't match the search query
  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}
</script>
