
// params
// data
// browser.contextMenus.create

// browser.contextMenus.onClicked.addListener, info
// info.menuItemId == data.id
// doWork


import { print, notify, register } from "./proxy.js";

export const setupMenuSaveText = () => {
  browser.contextMenus.create({
    title: 'Add selected to Focus',
    id: 'add-selected-to-focus',
    contexts: ['selection'],
  })
  .catch(print.failure_create_context_menu);

  browser.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === 'add-selected-to-focus') {
      // clipboard.writeText();
      browser.storage.local.get("notes")
        .then((result) => result.notes)
        .then((_notes) => ({
          notes: [
            ..._notes,
            `${info.pageUrl.split('#')[0]}#:~:text=${encodeURIComponent(info.selectionText)}`
          ]
        }))
        .then(browser.storage.local.set)
        .catch(print.failure_focus_add_selected);
    }
  });
}


// .then(() => {
//     return window.getSelection().toString();
// })
// .then((selectedText) => {
//     return browser.runtime.sendMessage({
//         type: "selected_text",
//         text: selectedText
//     });
// })

// context_menu_config.js

function searchSelectedText(info, tab) {
    const selectedText = info.selectionText;
    // Use the selected text to perform a search
    window.open(`https://www.google.com/search?q=${selectedText}`);
}

function translateSelectedText(info, tab) {
    const selectedText = info.selectionText;
    // Use the selected text to translate the text
    window.open(`https://translate.google.com/?text=${selectedText}`);
}

function defineSelectedText(info, tab) {
    const selectedText = info.selectionText;
    // Use the selected text to define the word
    window.open(`https://www.dictionary.com/browse/${selectedText}`);
}

function copySelectedText(info, tab) {
    // Copy the selected text to clipboard
    navigator.clipboard.writeText(info.selectionText);
}

function shareSelectedText(info, tab) {
    // Share the selected text
    navigator.share({
        title: "Shared text",
        text: info.selectionText,
        url: tab.url
    });
}

function saveSelectedText(info, tab) {
    // Save the selected text to a file
    const selectedText = info.selectionText;
    const blob = new Blob([selectedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = "selectedText.txt";
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
}

function speakSelectedText(info, tab) {
    const selectedText = info.selectionText;
    const utterance = new SpeechSynthesisUtterance(selectedText);
    window.speechSynthesis.speak(utterance);
}


export const config = [
    {
        id: "search_selected_text",
        title: "Search '%s'",
        contexts: ["selection"],
        onClick: searchSelectedText
    },
    {
        id: "translate_selected_text",
        title: "Translate '%s'",
        contexts: ["selection"],
        onClick: translateSelectedText
    },
    {
        id: "define_selected_text",
        title: "Define '%s'",
        contexts: ["selection"],
        onClick: defineSelectedText
    }
];

function copySelectedTextAsJSON(info, tab) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const selectedText = info.selectionText;
    const currentUrl = window.location.href;
    const referrer = document.referrer;
    const date = new Date();

    //expand the selection to include the parent element of the selected text
    TextUtils.expand(range, "word");
    //get the context text
    const contextText = TextUtils.getTextInRange(range);
    //get the encapsulating element
    const encapsulatingElement = range.startContainer.parentNode;
    //get the phash of the document text
    const phash = textToImageHash(document.body.innerText, document.body.innerText.length);
    const selectedPhash = textToImageHash(selectedText, selectedText.length * 2);

    // Create a JSON object with the selected text, current URL, referrer, date, context text, encapsulating element and phash
    const jsonData = {
        "selectedText": selectedText,
        "currentUrl": currentUrl,
        "referrer": referrer,
        "date": date,
        "contextText": contextText,
        "encapsulatingElement": encapsulatingElement,
        "phash": phash
    };

    // Convert the JSON object to a string
    const jsonString = JSON.stringify(jsonData);

    // Copy the JSON string to clipboard
    navigator.clipboard.writeText(jsonString);
}

function textToImageHash(text, size) {
    // Create an empty image with the specified size
    const image = new Array(size * size).fill(0);

    // Iterate over each character in the text
    for (let i = 0; i < text.length; i++) {
        // Get the ASCII value of the character
        const ascii = text.charCodeAt(i);
        // Set the corresponding pixel in the image to the ASCII value
        image[i] = ascii;
    }

    // Calculate the DCT of the image
    const dct = dct2d(image, size);

    // Take the low-frequency DCT coefficients
    const lowFrequencyDCT = dct.slice(0, 8);

    // Convert the low-frequency DCT coefficients to a bitstring
    let bitstring = '';
    for (let i = 0; i < lowFrequencyDCT.length; i++) {
        const value = lowFrequencyDCT[i];
        bitstring += value > 0 ? '1' : '0';
    }

    // Convert the bitstring to a hexadecimal string as the final hash value
    const hex = parseInt(bitstring, 2).toString(16);
    return hex;
}

function hammingDistance(str1, str2) {
    let distance = 0;
    for (let i = 0; i < str1.length; i++) {
        if (str1[i] !== str2[i]) {
            distance++;
        }
    }
    return distance;
}

function knn(dataset, newData, k) {
    // calculate the distance between the new data and all the dataset
    const distances = dataset.map(data => ({
        data: data.text,
        hash: textToImageHash(data.text),
        distance: hammingDistance(textToImageHash(data.text), textToImageHash(newData))
    }));

    // sort the distances array by distance
    distances.sort((a, b) => a.distance - b.distance);

    // return the k nearest neighbors
    return distances.slice(0, k);
}
