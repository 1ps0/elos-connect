<script>
  import { boldSearchTerm, findMatches } from './lib/apis.js';

  export let onSubmit = () => {}
  export let options = []
  export let searchModifiers = []
  export let className = ''
  export let themeColor = '#333'
  export let highlightTextColor = '#fff'

  const MODIFIERS = searchModifiers.reduce((acc, cur) => {
    acc[cur] = true

    return acc
  }, {})

  let results = [...options, ...searchModifiers]
  let searchModifier = ''
  let modifierLabelWidth
  let inputRef
  let showAutocompleteResults = false
  let highlightIndex = 0
  let selectedValue = ''

  const showResults = () => {
    highlightIndex = 0
    showAutocompleteResults = true
  }

  const hideResults = () =>
    showAutocompleteResults = false

  const removeSearchModifier = () => {
    searchModifier = ''
    inputRef.focus()
  }

  const handleInput = () => {
    if (!searchModifier) {
      showResults()
    }
  }

  const handleKeyDown = ({ key }) => {
    switch(key) {
      case 'Escape':
        hideResults()
        break
      case 'ArrowUp':
        if (showAutocompleteResults && highlightIndex === 0) {
          highlightIndex = matches.length - 1
        } else {
          highlightIndex -= 1
        }
        break
      case 'ArrowDown':
        if (!selectedValue && !showAutocompleteResults) {
          showResults()
          break
        }

        if (showAutocompleteResults && highlightIndex === matches.length - 1) {
          highlightIndex = 0
        } else {
          highlightIndex += 1
        }
        break
      case 'Tab':
        hideResults()
        break
      case 'Enter':
        const highlightedOption = matches[highlightIndex]
        const value = highlightedOption || selectedValue

        handleSubmit(value)
        break
      case 'Backspace':
        if (!selectedValue) {
          removeSearchModifier()
        }
        break
      default:
        return
    }
  }

  const handleSubmit = (value) => {
    if (!value) return

    if (searchModifiers.includes(value)) {
      searchModifier = value
    } else {
      onSubmit(value, searchModifier)
      removeSearchModifier()
    }

    selectedValue = ''
    hideResults()
  }

  const highlight = (index) =>
    index === highlightIndex

  $: matches = findMatches(results, selectedValue)
</script>


<div
  class="svelte-autocomplete {className}"
  style="--theme: {themeColor};
         --highlightTextColor: {highlightTextColor};
         --modifier-label-width: {modifierLabelWidth + 8}px;"
>
  <input
    bind:value={selectedValue}
    bind:this={inputRef}
    on:keydown={handleKeyDown}
    on:input={handleInput}
    on:click={showResults}
    class:modified-search={searchModifier}
  />
  {#if searchModifier}
    <span
      class="search-modifier"
      on:click={removeSearchModifier}
      bind:clientWidth={modifierLabelWidth}
    >
      {searchModifier}
    </span>
  {:else}
    <div
      class:showAutocompleteResults
      class="svelte-autocomplete-results-container"
      aria-hidden={showAutocompleteResults}
      autocapitalize="none"
      autocomplete="off"
      aria-autocomplete="list"
      role="combobox"
      aria-expanded={showAutocompleteResults}
    >
      <div class="click-catcher" on:click={hideResults} />
      <ul class="results-list" class:border-none={!matches.length}>
        {#each matches as match, index (match)}
          <li
            on:click={() => handleSubmit(match)}
            class:modifier={MODIFIERS[match]}
            class:highlight={index === highlightIndex}
            aria-selected={index === highlightIndex}
            aria-label={match}
            role="option"
          >
            {#if index >= options.length || MODIFIERS[match]}
              <span class="search-label">Search</span>
            {/if}
            {@html boldSearchTerm(match, selectedValue)}
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>


<style>
  .svelte-autocomplete {
    display: inline-block;
    position: relative;
    overflow: auto !important;
  }

  input {
    height: 2.25rem;
    min-width: 200px;
    padding: .25rem .5rem;
    font-size: 1rem;
    color: #333;
    border-radius: .25rem;
    box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.1);
  }

  input.modified-search { padding: .25rem 2rem .25rem var(--modifier-label-width); }

  input,
  .results-list { border: 1px solid #dbdbdb; }

  .search-modifier {
    display: block;
    position: absolute;
    left: .25rem;
    top: .25rem;
    height: calc(100% - .5rem);
    display: flex;
    align-items: center;
    padding: .25rem;
    border-radius: 3px;
    background-color: var(--theme);
    color: var(--highlightTextColor);
    font-size: 14px;
  }

  .svelte-autocomplete-results-container { display: none; }

  .svelte-autocomplete-results-container.showAutocompleteResults { display: block; }

  .click-catcher {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .results-list {
    width: calc(100% - 2px);
    position: absolute;
    left: 1px;
    top: 35px;
    list-style-type: none;
    background-color: #fff;
    color: #595959;
    border-radius: 0 0 2px 2px;
    padding-left: 0;
    margin: 0;
    z-index: 10;
    text-align: left;
  }

  .results-list.border-none { border: none; }

  .results-list li {
    padding: .5rem;
    user-select: none;
  }

  :global(.results-list li span) {
    font-weight: bold;
    color: #111;
  }

  .modifier {
    display: flex;
    align-items: center;
    border-top: 1px solid #dbdbdb;
  }

  .search-label {
    border: 1px solid var(--theme);
    background-color: var(--theme);
    border-radius: .25rem;
    padding: .25rem;
    margin-right: .25rem;
    color: var(--highlightTextColor);
    font-size: .5rem;
    font-weight: 500;
  }

  .highlight .search-label { border: 1px solid var(--highlightTextColor); }

  .highlight,
  .results-list li:hover,
  :global(.results-list li:hover span),
  :global(.results-list .highlight span) {
    background: var(--theme);
    color: var(--highlightTextColor);
    font-weight: normal;
  }

  :global(.svelte-autocomplete svg) {
    width: 1.5rem;
    position: absolute;
    top: .25rem;
    right: .35rem;
    fill: var(--theme);
  }
</style>

<!--

function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}

/*An array containing all the country names in the world:*/
var countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua & Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia & Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Central Arfrican Republic","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cuba","Curacao","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauro","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","North Korea","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre & Miquelon","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","St Kitts & Nevis","St Lucia","St Vincent","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad & Tobago","Tunisia","Turkey","Turkmenistan","Turks & Caicos","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States of America","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];

/*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
autocomplete(document.getElementById("myInput"), countries);
-->