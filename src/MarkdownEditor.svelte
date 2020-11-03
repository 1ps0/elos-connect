<script>
import { SimpleMDE } from 'simplemde';


function download(filename, text) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

let simpleMde = new SimpleMDE({
    element: document.getElementById("notesEditor"),
    autoDownloadFontAwesome: false,
    spellChecker: false,
    status: false,
    placeholder: "all your notes...",
    toolbar: [{
      name: "bold",
      action: SimpleMDE.toggleBold,
      className: "icon-bold",
      title: "Bold",
    },
    {
      name: "italic",
      action: SimpleMDE.toggleItalic,
      className: "icon-italic",
      title: "Italic",
    },
    {
      name: "heading",
      action: SimpleMDE.toggleHeadingSmaller,
      className: "icon-header",
      title: "Heading",
    },
    {
      name: "unordered-list",
      action: SimpleMDE.toggleUnorderedList,
      className: "icon-list-ul",
      title: "Unordered list",
    },
    {
      name: "ordered-list",
      action: SimpleMDE.toggleOrderedList,
      className: "icon-list-ol",
      title: "Ordered list",
    },
    {
      name: "link",
      action: SimpleMDE.drawLink,
      className: "icon-link",
      title: "Toggle link",
    },
    {
      name: "image",
      action: SimpleMDE.drawImage,
      className: "icon-image",
      title: "Image",
    },
    {
      name: "quote",
      action: SimpleMDE.toggleBlockquote,
      className: "icon-quote-right",
      title: "Quote",
    },
    {
      name: "preview",
      action: SimpleMDE.togglePreview,
      className: "icon-eye no-disable",
      title: "Preview",
    },
    {
      name: "what",
      action: toggleHelp,
      className: "icon-question-circle no-disable",
      title: "What is this?",
    }, {
      name: "download",
      action: e => download("notedown.md", e.value()),
      className: "icon-download no-disable",
      title: "Download",
    }
  ]
});
</script>


<textarea id="notesEditor"></textarea>

<style>


</style>

