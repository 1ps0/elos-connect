<script>
import { onMount } from 'svelte';

export let queue = [];
$: queue;
// $: console.log('queue -->', queue);

// function usable() {
//   return {
//     update(e) {

//     },
//     destroy() {

//     }
//   };
// }

const fetchFromLocalStorage = (item) => {
    return JSON.parse(localStorage.getItem(item));
};

const saveToLocalStorage = (item, value) => {
    localStorage.setItem(item, JSON.stringify(value));
};

const removeEntry = (e) => e.target.parentElement.remove();
const saveEntry = (e) => {
    console.log(e);
    saveToLocalStorage("log-1", e);
};

function addEntry(e) {
    queue.push({ text: '' })
    queue = queue;
}

// below code borrowed from https://www.w3schools.com/howto/howto_js_todolist.asp

// Create a new list item when clicking on the "Add" button
function newElement() {
  var li = document.createElement("li");
  var inputValue = document.getElementById("task-input").value;
  var t = document.createTextNode(inputValue);
  li.appendChild(t);
  if (inputValue === '') {
    alert("You must write something!");
  } else {
    document.getElementById("task-list").appendChild(li);
  }
  document.getElementById("task-input").value = "";

  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  li.appendChild(span);

  for (i = 0; i < close.length; i++) {
    close[i].onclick = function() {
      var div = this.parentElement;
      div.style.display = "none";
    }
  }
}

onMount(async () => {
  // console.log('mounted');
  // queue = [fetchFromLocalStorage("log-1")];
  // console.log([fetchFromLocalStorage("log-1")]);


  // Create a "close" button and append it to each list item
  var myNodelist = document.getElementsByTagName("li");
  var i;
  for (i = 0; i < myNodelist.length; i++) {
    var span = document.createElement("span");
    var txt = document.createTextNode("\u00D7");
    span.className = "close";
    span.appendChild(txt);
    myNodelist[i].appendChild(span);
  }

  // Click on a close button to hide the current list item
  var close = document.getElementsByClassName("close");
  var i;
  for (i = 0; i < close.length; i++) {
    close[i].onclick = function() {
      var div = this.parentElement;
      div.style.display = "none";
    }
  }

  // Add a "checked" symbol when clicking on a list item
  var list = document.querySelector('ul');
  list.addEventListener('click', function(ev) {
    if (ev.target.tagName === 'li') {
      ev.target.classList.toggle('checked');
    }
  }, false);

});

function markAsDone(item) {
  console.log('------>', e);
  // TODO remove from this queue and pass to callback/update to next queue
  return queue.remove(item)
}

</script>


<section class="log-body">
    <ul id="task-list">
      <!-- <li>
        <div id="add-btn">
          <input type="text" id="task-input" placeholder="">
          <span on:click={newElement}>Add</span>
        </div>
      </li> -->
      {#each queue as item}
      <!-- use:usable={queue} on:click={() => markAsDone(item) }  -->
        <li class="{ item.checked ? 'checked' : ''}">{item.text}</li>
      {/each}
    </ul>
</section>

<style>

.type-study span {
  float:left;
  background-color: green;
  width: 80px;
}

.type-label span {
  border: 1px solid black;
  padding: 10px 30px 10px 30px;
  margin: 5px;
  border-radius: 5px;
  padding: 15px;
}

.log-body {
  margin: 10px;
  min-width: 250px;
}

/* Include the padding and border in an element's total width and height */
* {
  box-sizing: border-box;
}

/* Remove margins and padding from the list */
ul {
  margin: 0;
  padding: 0;
}

/* Style the list items */
ul li {
  cursor: pointer;
  position: relative;
  padding: 12px 8px 12px 40px;
  list-style-type: none;
  background: #eee;
  font-size: 18px;
  transition: 0.2s;

  /* make the list items unselectable */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Set all odd list items to a different color (zebra-stripes) */
ul li:nth-child(odd) {
  background: #f9f9f9;
}

/* Darker background-color on hover */
ul li:hover {
  background: #ddd;
}

/* When clicked on, add a background color and strike out text */
ul li.checked {
  background: #888;
  color: #fff;
  text-decoration: line-through;
}

/* Add a "checked" mark when clicked on */
ul li.checked::before {
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
}

/* Style the close button */
.close {
  position: relative;
  right: 0;
  top: 0;
  padding: 12px 16px 12px 16px;
}

.close:hover {
  background-color: #f44336;
  color: white;
}

/* Style the header */
.header {
  background-color: gray;
  padding: 20px 30px;
  color: white;
  text-align: center;
}

/* Clear floats after the header */
.header:after {
  content: "";
  display: table;
  clear: both;
}

/* Style the input */
#task-input input {
  margin: 0;
  border: none;
  border-radius: 0;
  width: 75%;
  padding: 10px;
  float: left;
  font-size: 16px;
}

/* Style the "Add" button */
#add-btn span {
  padding: 10px;
  width: 50px;
  background: #d9d9d9;
  color: #555;
  text-align: center;
  font-size: 16px;
  transition: 0.3s;
  border-radius: 0;
}

#add-btn:hover span {
  background-color: #bbb;
}

</style>
