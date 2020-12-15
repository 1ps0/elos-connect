<script>
// https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_contact_form

import { onMount, createEventDispatcher, getContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";

const dispatch = createEventDispatcher();

onMount(async () => {
  console.log('SelectList mounted', item);
  // console.log('selectlist', items, eventName, visibleItems);

  dispatch("didMount", item);
});


export let action = "/api/";
export let fields = [
    {
        id:  "fname",
        name: "firstname",
        label: "First Name",
        placeholder: "Your name...",
        type: "input:text"
    },
    {
        id:  "country",
        name: "country",
        label: "Country",
        options: [
            {
                name: "Australia",
                value: "australia"
            },
        ],
        type: "select"
    },
    {
        id:  "subject",
        name: "subject",
        label: "Subject",
        placeholder: "Write something...",
        type: "textarea"
    }
];
export let data = {};

$: data = new FormData(document.querySelector('#entryform'));
$: fields;

function sendData() {
  console.log(data);
  return 200;
}

</script>

<section>

<div class="container">
  <form id="entryform" on:submit|preventDefault={sendData}>
    {#each fields as field (field.name)}
        <label for="{field.name}">{field.label}</label>

        {#if field.type === "input:text"}
        <input type="text" id="{field.name}" name="{field.name}" placeholder="{field.placeholder}">

        {:else if field.type === "select"}
        <select id="{field.name}" name="{field.name}">
        {#each field.options as item}
            <option value="{item.value}">{item.name}</option>
        {/each}
        </select>

        {:else if field.type === "textarea"}
        <textarea id="{field.name}" name="{field.name}" placeholder="{field.placeholder}" style="height:200px"></textarea>
        {/if}
    {/each}
    <input type="submit" value="Submit">
  </form>
</div>

</section>

<style>
body {font-family: Arial, Helvetica, sans-serif;}
* {box-sizing: border-box;}

input[type=text], select, textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  margin-top: 6px;
  margin-bottom: 16px;
  resize: vertical;
}

input[type=submit] {
  background-color: #4CAF50;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

input[type=submit]:hover {
  background-color: #45a049;
}

.container {
  border-radius: 5px;
  background-color: #f2f2f2;
  padding: 20px;
}
</style>
