import { MarkdownSerializer } from "prosemirror-markdown";
import { defaultMarkdownSerializer } from "prosemirror-markdown";

export const customMarkdownSerializer = new MarkdownSerializer(
  {
    // 1) Pull in defaults for other nodes
    ...defaultMarkdownSerializer.nodes,

    // 2) Paragraph override: If in a tight list, only flushClose(1) => one newline
    paragraph(state, node) {
      state.renderInline(node);
      if (state.inTightList) {
        state.flushClose(1); // single newline
      } else {
        state.closeBlock(node); // default => blank line
      }
    },

    // 3) List item override: Just render content (avoid extra blank lines)
    list_item(state, node) {
      state.renderContent(node);
    },

    // 4) Our custom 'list' node
    list(state, node) {
      const isTight =
        node.attrs.tight !== undefined
          ? node.attrs.tight
          : state.options.tightLists;
      const prevTight = state.inTightList;
      state.inTightList = isTight;

      // Use "-" for bullets, or "1." for numbered
      const bullet = node.attrs.kind === "bullet" ? "-" : "1.";

      // Decide how many blank lines to insert before this list
      if (state.closed) {
        // If the last node was a heading, add two newlines
        if (state.closed.type.name === "heading") {
          state.flushClose(2);
        }
        // If we are in a tight list, just one newline
        else if (isTight) {
          state.flushClose(1);
        }
        // Otherwise use two newlines
        else {
          state.flushClose(2);
        }
      }

      // Render each child (paragraph or nested list)
      node.forEach((child, _, i) => {
        // If multiple items in a tight list, ensure only one newline between items
        if (i > 0 && isTight) {
          state.flushClose(1);
        }

        if (child.type.name === "list") {
          // Nested list => no extra bullet, just indent
          state.wrapBlock("  ", null, child, () => {
            state.render(child, node, i);
          });
        } else {
          // Normal item => prepend bullet or "1."
          state.wrapBlock("  ", bullet + " ", child, () => {
            state.render(child, node, i);
          });
        }
      });

      state.inTightList = prevTight;
    },

    // 5) Update tag serialization to match the original format
    tag: (state, node) => {
      state.write(`@[${node.attrs.label}](${node.attrs.id})`);
    },
    backlink: (state, node) => {
      state.write(`[[${node.attrs.label}]]`);
    },
  },
  defaultMarkdownSerializer.marks
);
