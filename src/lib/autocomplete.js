
import { createEventDispatcher } from 'svelte';
import { writable, readable, derived, get } from "svelte/store";

// https://github.com/themarquisdesheric/simply-svelte-autocomplete
import { boldSearchTerm, findMatches } from './apis.js';


export function autocomplete(node, args) {

  const dispatch = createEventDispatcher();

  let onSubmit = (e) => [args.onSubmit, e];
  let options = [];
  let searchModifiers = [];
  let className = '';
  let themeColor = '#333';
  let highlightTextColor = '#fff';

  const MODIFIERS = searchModifiers.reduce((acc, cur) => {
    acc[cur] = true

    return acc
  }, {});

  let results = [...options, ...searchModifiers];
  let searchModifier = '';
  let modifierLabelWidth;
  let inputRef;
  let showAutocompleteResults = false;
  let highlightIndex = 0;
  let selectedValue = '';

  const highlight = (index) => index === highlightIndex;
  const hideResults = () => showAutocompleteResults = false;

  const showResults = () => {
    highlightIndex = 0;
    showAutocompleteResults = true;
  };


  const removeSearchModifier = () => {
    searchModifier = '';
    inputRef.focus();
  };

  const handleInput = () => {
    if (!searchModifier) {
      showResults()
    }
  };

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

        handleSubmit(value);
        break
      case 'Backspace':
        if (!selectedValue) {
          removeSearchModifier();
        }
        break;
      default:
        return;
    }
  };

  const handleSubmit = (value) => {
    if (!value) return

    if (searchModifiers.includes(value)) {
      searchModifier = value;
    } else {
      onSubmit(value, searchModifier);
      removeSearchModifier();
    }

    selectedValue = '';
    hideResults();
  }




  console.log("processed autocomplete", node, file);

  // node.addEventListener('click', openFileHandler);

  return {
    update(val) {
      console.log("autocomplete got update", val);
    },
    destroy() {
      console.log("autocomplete is destroyed");
      // node.removeEventListener('openFile', _handler);
    }
  };
};
