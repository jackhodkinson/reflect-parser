import { Schema } from "prosemirror-model";
import { schema as baseSchema } from "prosemirror-markdown";

// For debugging
console.log("Base schema nodes:", Object.keys(baseSchema.spec.nodes));

// Extend the base schema by adding our tag node
export const customSchema = new Schema({
  nodes: baseSchema.spec.nodes
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
        kind: { default: "bullet" },
        checked: { default: false },
        collapsed: { default: false },
        guid: { default: "" },
        tight: { default: true },
      },
      parseDOM: [{ tag: "ul" }],
      toDOM() {
        return ["ul", 0];
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
    }),
  marks: baseSchema.spec.marks
    .update("italic", {
      parseDOM: [{tag: "i"}, {tag: "em"}, {style: "font-style=italic"}],
      toDOM() { return ["em", 0] }
    })
    .update("bold", {
      parseDOM: [{tag: "strong"}, {tag: "b"}, {style: "font-weight=bold"}],
      toDOM() { return ["strong", 0] }
    })
    .update("code", {
      parseDOM: [{tag: "code"}],
      toDOM() { return ["code", 0] }
    })
    .update("link", {
      attrs: {
        href: {},
        title: {default: null}
      },
      parseDOM: [{
        tag: "a[href]",
        getAttrs(dom) {
          return {
            href: dom.getAttribute("href"),
            title: dom.getAttribute("title")
          }
        }
      }],
      toDOM(node) { return ["a", node.attrs, 0] }
    })
    .addToEnd("textHighlight", {
      attrs: {
        color: { default: "yellow" }
      },
      parseDOM: [{
        tag: "mark",
        getAttrs(dom) {
          return {
            color: dom.getAttribute("data-color") || "yellow"
          }
        }
      }],
      toDOM(node) {
        return ["mark", { "data-color": node.attrs.color }, 0]
      }
    })
});

// For debugging
console.log("Combined nodes:", Object.keys(customSchema.spec.nodes));
