import { Schema } from "prosemirror-model";
import { schema as baseSchema } from "prosemirror-markdown";

// For debugging
console.log("Base schema nodes:", Object.keys(baseSchema.spec.nodes));

// Extend the base schema by adding our tag node
export const customSchema = new Schema({
  nodes: baseSchema.spec.nodes
    .addToEnd("hardBreak", {
      inline: true,
      group: "inline",
      selectable: false,
      parseDOM: [{ tag: "br" }],
      toDOM() {
        return ["br"];
      },
    })
    .addToEnd("iframe", {
      group: "block",
      attrs: {
        src: { default: "" },
        allowFullScreen: { default: true },
        frameBorder: { default: 0 },
        type: { default: "youtube" },
        width: { default: 560 },
        height: { default: 315 }
      },
      parseDOM: [{ tag: "iframe" }],
      toDOM(node) {
        return ["iframe", node.attrs];
      },
    })
    .addToEnd("horizontalRule", {
      group: "block",
      parseDOM: [{ tag: "hr" }],
      toDOM() {
        return ["hr"];
      },
    })
    .addToEnd("codeBlock", {
      content: "text*",
      group: "block",
      code: true,
      defining: true,
      attrs: { params: { default: "" } },
      parseDOM: [
        {
          tag: "pre",
          preserveWhitespace: "full",
          getAttrs: (node) => ({
            params: node.getAttribute("data-params") || "",
          }),
        },
      ],
      toDOM(node) {
        return [
          "pre",
          node.attrs.params ? { "data-params": node.attrs.params } : {},
          ["code", 0],
        ];
      },
    })
    .addToEnd("orderedList", {
      content: "listItem+",
      group: "block",
      attrs: {
        order: { default: 1 },
        tight: { default: true },
      },
      parseDOM: [
        {
          tag: "ol",
          getAttrs(dom) {
            return {
              order: dom.hasAttribute("start")
                ? +dom.getAttribute("start")!
                : 1,
            };
          },
        },
      ],
      toDOM(node) {
        return node.attrs.order === 1
          ? ["ol", 0]
          : ["ol", { start: node.attrs.order }, 0];
      },
    })
    .addToEnd("listItem", {
      content: "paragraph block*",
      defining: true,
      attrs: {
        closed: { default: false },
        nested: { default: false },
      },
      parseDOM: [{ tag: "li" }],
      toDOM() {
        return ["li", 0];
      },
    })
    .addToEnd("tag", {
      attrs: {
        id: { default: "" },
        label: { default: "" },
        graphId: { default: "" },
      },
      group: "inline",
      inline: true,
      atom: true,
      toDOM: (node) => [
        "span",
        {
          "data-tag": node.attrs.id,
          class: "tag",
        },
        node.attrs.label,
      ],
    })
    .addToEnd("backlink", {
      attrs: {
        id: { default: "" },
        label: { default: "" },
      },
      group: "inline",
      inline: true,
      atom: true,
      toDOM: (node) => [
        "span",
        {
          class: "backlink",
        },
        node.attrs.label,
      ],
    })
    .update("list", {
      content: "list_item+",
      group: "block",
      attrs: {
        kind: { default: "bullet" }, // bullet, ordered, or task
        checked: { default: false },
        collapsed: { default: false },
        guid: { default: "" },
        tight: { default: true },
        archived: { default: false },
      },
      parseDOM: [
        { tag: "ul", getAttrs: () => ({ kind: "bullet" }) },
        { tag: "ol", getAttrs: () => ({ kind: "ordered" }) },
        { tag: "ul[data-task]", getAttrs: () => ({ kind: "task" }) },
      ],
      toDOM(node) {
        return node.attrs.kind === "task"
          ? ["ul", { "data-task": "true" }, 0]
          : node.attrs.kind === "ordered"
          ? ["ol", 0]
          : ["ul", 0];
      },
    })
    .addToEnd("list_item", {
      content: "paragraph block*",
      defining: true,
      parseDOM: [{ tag: "li" }],
      toDOM() {
        return ["li", 0];
      },
    })
    .addToEnd("tweet", {
      attrs: {
        tweetData: { default: {} },
        url: { default: "" },
      },
      group: "block",
      content: "",
      toDOM: (node) => [
        "div",
        {
          class: "tweet",
        },
        node.attrs.tweetData.text || "",
      ],
    })
    .addToEnd("file", {
      attrs: {
        url: { default: "" },
        fileName: { default: "" },
        fileType: { default: "" },
        fileSize: { default: null }
      },
      group: "block",
      content: "",
      toDOM: (node) => [
        "div",
        {
          class: "file-attachment",
          "data-url": node.attrs.url,
          "data-filename": node.attrs.fileName,
          "data-filetype": node.attrs.fileType
        }
      ],
    }),
  marks: baseSchema.spec.marks
    .update("em", {
      parseDOM: [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }],
      toDOM() {
        return ["em", 0];
      },
    })
    .addToEnd("italic", {
      // Alias for em
      parseDOM: [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }],
      toDOM() {
        return ["em", 0];
      },
    })
    .update("strong", {
      parseDOM: [
        { tag: "strong" },
        { tag: "b" },
        { style: "font-weight=bold" },
      ],
      toDOM() {
        return ["strong", 0];
      },
    })
    .addToEnd("bold", {
      // Alias for strong
      parseDOM: [
        { tag: "strong" },
        { tag: "b" },
        { style: "font-weight=bold" },
      ],
      toDOM() {
        return ["strong", 0];
      },
    })
    .update("code", {
      parseDOM: [{ tag: "code" }],
      toDOM() {
        return ["code", 0];
      },
    })
    .update("link", {
      attrs: {
        href: {},
        title: { default: null },
      },
      parseDOM: [
        {
          tag: "a[href]",
          getAttrs(dom) {
            return {
              href: dom.getAttribute("href"),
              title: dom.getAttribute("title"),
            };
          },
        },
      ],
      toDOM(node) {
        return ["a", node.attrs, 0];
      },
    })
    .addToEnd("textHighlight", {
      attrs: {
        color: { default: "yellow" },
      },
      parseDOM: [
        {
          tag: "mark",
          getAttrs(dom) {
            return {
              color: dom.getAttribute("data-color") || "yellow",
            };
          },
        },
      ],
      toDOM(node) {
        return ["mark", { "data-color": node.attrs.color }, 0];
      },
    })
    .addToEnd("underline", {
      parseDOM: [{ tag: "u" }, { style: "text-decoration=underline" }],
      toDOM() {
        return ["u", 0];
      },
    }),
});

// For debugging
console.log("Combined nodes:", Object.keys(customSchema.spec.nodes));
