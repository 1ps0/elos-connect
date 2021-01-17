<script>
// https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_contact_form
/*
TODO
1. add metric for DataGrid panel
2. handle Poll/prompt type inputs
3.
*/


import { onMount, createEventDispatcher, getContext } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";

const dispatch = createEventDispatcher();




export let item;
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
export let formData = {};
export let pinned = {};
export let selectedForm = {};
export let dataStore = null;
polls = [
  {
    title: "Current Stress",
    name: "stress",
    context: "current_time",
    category: "personal_metric",
    value_type: "float",
    value_control: false
  },
  {
    title: "Calorie Intake",
    name: "calories",
    context: "food",
    category: "personal_metric",
    value_type: "integer",
    value_control: false
  },
  {
    title: "Current Stress",
    name: "stress",
    context: "current_time",
    category: "personal_metric",
    value_type: "float",
    value_control: false
  },
  {
    title: "Brain Clearing",
    message: "Write at least 100 words. Any words.",
    affinity: "morning",
    category: "session_prompt",
    value_type: "text",
    value_control: false
  },
  {
    title: "Day Start",
    message: "What is your main focus today?",
    affinity: "morning",
    category: "session_prompt",
    value_type: "text",
    value_control: false
  },
  {
    title: "Day Evening",
    message: "What are you most proud of today?",
    affinity: "evening",
    category: "session_prompt",
    value_type: "text",
    value_control: false
  },
  {
    title: "Day Check-in",
    message: "What's on your mind?",
    affinity: "checkin",
    category: "session_prompt",
    value_type: "text",
    value_control: false
  },
];

let fieldTypes = ["select", "slider", "text", "textarea"]; //.map((t) => `input:${t}`);

let formTypes = {
  singleType: {
    formType: "singleValue",
    name: "",
    title: "",
    fields: [
      {
        name: "",
        type: "",
        valueType: "",
        options: []
      },
    ]
  },
  promptType: {
    formType: "promptType",
    name: "Journal",
    fields: [
      {
        name: "",
        type: "",
        valueType: "keyword",
        analyzer: "captureTime",
        options: [],
      }
    ]
  }
};

$: selectedForm;
$: formData; // = new FormData();
$: pinned = {...pinned, data};

function doSubmit(e) {
  let selector = document.querySelector('#entryform');
  data = new FormData(selector);

  if (dataStore) {
    console.log("EntryForm got data", data);
    dataStore.update(n => [...n, {
      ...form,
      values: data.values

    }]);
  }
}


onMount(async () => {
  console.log('EntryForm mounted');

});

</script>

<section>

<div class="container">
  <form id="entryform" on:submit|preventDefault={sendData}>
    {#if pinned.length > 0}
      <select id="{pinned.name}" name="{pin.name}">
        {#each pinned.items as pin}
          <option value="{pin.value}">{pin.name}</option>
        {/each}
      </select>
    {/if}
    {#if formTypes.length > 1}
      <select id="{pinned.name}" name="{pin.name}">
        {#each formTypes as fType}
          <option on>{fType}</option>
        {/each}
      </select>
    {/if}
    {#key selectedForm.formType}
      <label for="{selectedForm.name}">{selectedForm.title}</label>
      {#each selectedForm.fields as field (field.name)}
        <label for="{field.name}">{field.label}</label>

        {#if field.type === "input:text"}
          <input
            type="text" id="{field.name}"
            name="{field.name}" placeholder="{field.placeholder}">

        {:else if field.type === "select"}
          <select id="{field.name}" name="{field.name}">
          {#each field.options as item}
              <option value="{item.value}">{item.name}</option>
          {/each}
          </select>

        {:else if field.type === "textarea"}
          <textarea
            id="{field.name}"
            name="{field.name}"
            placeholder="{field.placeholder}"
            style="height:200px">

          </textarea>
        {/if}
      {/each}
      <input type="submit" value="Submit" on:submit|preventDefault={doSubmit}>
    {/key}
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
