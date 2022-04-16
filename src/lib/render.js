// import _browser from "webextension-polyfill";

// require readability

// import DOMPurify from 'dompurify';
// import Readability from '@mozilla/readability';

// export function renderReadable(doc, options) {
//   let cleanDoc = DOMPurify.sanitize(doc);
//   return new Readability(cleanDoc, options).parse();
// }

// export function renderJSON(doc) {
//   let reader = renderReadable(doc.cloneNode(true), {
//     debug: true,
//     keepClasses: false,
//   });

//   // title: article title;
//   // content: HTML string of processed article content;
//   // textContent: text content of the article, with all the HTML tags removed;
//   // length: length of an article, in characters;
//   // excerpt: article description, or short excerpt from the content;
//   // byline: author metadata;
//   // dir: content direction;
//   // siteName: name of the site.

//   return {
//     type: "article",
//     saveTo: "file",
//     title: reader.title,
//     url: reader.siteName,
//     length: reader.length,
//     exerpt: reader.exerpt,
//     author: reader.byline,
//     html: reader.content,
//     text: reader.textContent
//   };
// }

