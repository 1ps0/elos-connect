<script>
import jquery from './jquery-1.11.1.js';
const axios = require('axios');

// url target for this prompt
export let target = "/api/user/prompt/";

export let data = {};

let button_enabled = true;
let button_title = "SUBMIT";

$: button_enabled;
$: button_title;
$: prompt_response; // text for this prompt. dynamic

function sendPrompt() {
  axios.post(target, {
          params: {
            prompt: prompt_text,
            response: prompt_response,
          }
      })
      .then((response) => {
          // let result = response.data;
          hideTextarea();
      })
      .catch((error) => {
          console.log("PROMPT: got error on fetch", error);
      });
  return 200;
}

function hideTextarea() {
  jquery(`#${this_prompt} textarea`).hide();
}

function toggleVisible() {
  if (jquery(`.${this_prompt}-prompt-form`).is(':visible')) {
    jquery(`.${this_prompt}-prompt-form`).hide();
    jquery(`.${this_prompt}-hide-button`).text('show');
  } else {
    jquery(`.${this_prompt}-prompt-form`).show();
    jquery(`.${this_prompt}-hide-button`).text('hide');
  }
}

</script>

<section>
  {#each messages as message}
  <div class="container {message.is_me ? '' : 'darker'}">
    <img src="{message.profile" alt="">
    <p>{message.text}</p>
    <span class="time-{message.is_me ? 'right' : 'left'}">
      {(new Date()).toLocaleTimeString()}
    </span>
  </div>
  {/each>}
</section>

<!--
<div class="prompt">
  <div class="hide-button" on:click={toggleVisible}>hide</div>
  <div class="{this_prompt}-prompt-box">
    <h3 class="prompt-title">{title}</h3>
    <form class="{this_prompt}-prompt-form" on:submit={
      (e) => {
        e.preventDefault();
        if (button_enabled === false)
          return;

        console.log("prompt submit", e.target["0"].value);
        let ret = sendPrompt();
        if (ret === 200) {
          hideTextarea();
        }

      }
    }>
      <label>{prompt_text}</label>
      <textarea id="{this_prompt}" name="content" on:input={
        (e) => {
          console.log("content changed", e.target.value);
          prompt_response = e.target.value;
        }
      }></textarea>
      <hr/>
      <input class="{this_prompt}-submit-prompt" type="submit" value="{button_title}"/>
      <label>{prompt_response}</label>
    </form>
  </div>
</div>
-->
<style>

.hide-button {
  text-transform: uppercase;
  font-size: 0.5em;
  border: 1px solid black;
  display: block;
  float: left;
  padding: 10px 10px 10px 10px;
}

.prompt-box {
  display: block;
}

.submit-prompt {

}

.prompt div {
  border: 1px solid black;
  padding: 20px 20px 20px 20px;
}

textarea {
  min-width: 300px;
  max-width: 900px;
  width: 70%;
  border: 1px solid black;
}

/* --------- */

.right {
  width:100%;
}

section {
  margin: 0 auto;
  max-width: 800px;
  padding: 0 20px;
}

.container {
  border: 2px solid #dedede;
  background-color: #f1f1f1;
  border-radius: 5px;
  padding: 10px;
  margin: 10px 0;
}

.darker {
  border-color: #ccc;
  background-color: #ddd;
}

.container::after {
  content: "";
  clear: both;
  display: table;
}

.container img {
  float: left;
  max-width: 60px;
  width: 100%;
  margin-right: 20px;
  border-radius: 50%;
}

.container img.right {
  float: right;
  margin-left: 20px;
  margin-right:0;
}

.time-right {
  float: right;
  color: #aaa;
}

.time-left {
  float: left;
  color: #999;
}

</style>
