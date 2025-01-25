import { Schema } from "prosemirror-model"
import { schema as baseSchema } from "../prosemirror-markdown/src/schema"

// For debugging
console.log("Base schema nodes:", Object.keys(baseSchema.spec.nodes))

// Extend the base schema by adding our tag node
export const customSchema = new Schema({
  nodes: baseSchema.spec.nodes.addToEnd("tag", {
    attrs: {
      id: { default: '' },
      label: { default: '' },
      graphId: { default: '' }
    },
    group: "inline",
    inline: true,
    atom: true,
    toDOM: node => ["span", {
      "data-tag": node.attrs.id,
      class: "tag"
    }, node.attrs.label]
  }).addToEnd("backlink", {
    attrs: {
      id: { default: '' },
      label: { default: '' }
    },
    group: "inline",
    inline: true,
    atom: true,
    toDOM: node => ["span", {
      class: "backlink"
    }, node.attrs.label]
  }).update("list", {
    content: "list_item+",
    group: "block",
    attrs: {
      kind: { default: "bullet" },
      checked: { default: false },
      collapsed: { default: false },
      guid: { default: "" },
      tight: { default: true }
    },
    parseDOM: [{tag: "ul"}],
    toDOM() { return ["ul", 0] }
  }).addToEnd("list_item", {
    content: "paragraph block*",
    defining: true,
    parseDOM: [{tag: "li"}],
    toDOM() { return ["li", 0] }
  }),
  marks: baseSchema.spec.marks
})

// For debugging
console.log("Combined nodes:", Object.keys(customSchema.spec.nodes)) 