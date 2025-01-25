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

    orderedList(state, node) {
      // Use the `order` attribute if present; default to 1
      const start = node.attrs.order || 1;

      // In ProseMirror, "tight" means fewer blank lines between list items
      const prevTight = state.inTightList;
      const isTight = node.attrs.tight ?? state.options.tightLists;
      state.inTightList = isTight;

      // If the last node was something that needs a blank line before
      // starting this new list, handle it:
      if (state.closed) {
        if (isTight) {
          state.flushClose(1); // tight => single newline
        } else {
          state.flushClose(2); // default => two newlines
        }
      }

      // Render each list item in turn, incrementing the bullet number
      node.forEach((child, _, i) => {
        // For tight lists, ensure only one newline between items
        if (i > 0 && isTight) {
          state.flushClose(1);
        }
        // e.g. if start=3, first item is "3. ", second is "4. ", etc.
        const bullet = `${start + i}. `;

        // We indent the content with `"  "` and prefix each line with bullet
        state.wrapBlock("  ", bullet, child, () => {
          state.render(child, node, i);
        });
      });

      // Restore previous `inTightList` setting
      state.inTightList = prevTight;
    },

    // And remember to customize "orderedList" items if needed:
    listItem(state, node) {
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

      // Use "-" for bullets, "1." for numbered, or "[ ]"/"[x]" for tasks
      let bullet = "- ";
      if (node.attrs.kind === "ordered") {
        bullet = "1. ";
      } else if (node.attrs.kind === "task") {
        bullet = node.attrs.checked ? "[x] " : "[ ] ";
      }

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
          state.wrapBlock("  ", bullet, child, () => {
            state.render(child, node, i);
          });
        }
      });

      state.inTightList = prevTight;
    },

    // 5) Update tag serialization to match the original format
    tag: (state, node) => {
      state.write(`#${node.attrs.label}`);
    },
    backlink: (state, node) => {
      state.write(`[[${node.attrs.label}]]`);
    },
    tweet: (state, node) => {
      const tweetData = node.attrs.tweetData;
      // Get current indentation level from state, but remove one level
      const baseIndent = ((state as any).delim || "").slice(0, -2);

      // if tweetData contains user and text, write it out
      if (tweetData.user && tweetData.text) {
        state.write(
          `#tweet from ${tweetData.user.name} (@${tweetData.user.screen_name})\n`
        );
        // Split text into lines and indent each one, maintaining parent indentation
        const lines = tweetData.text.split("\n");
        lines.forEach((line: string, index: number) => {
          state.write(`${baseIndent}${line}`);
          if (index < lines.length - 1) state.write("\n");
        });
        state.closeBlock(node);
      } else {
        state.write(`[View Tweet](${tweetData.url})`);
      }
      state.closeBlock(node);
    },
    hardBreak: (state) => {
      state.write("\n");
    },
    iframe: (state, node) => {
      state.write(`[View Video](${node.attrs.src})`);
      state.closeBlock(node);
    },
    horizontalRule: (state, node) => {
      state.write("---");
      state.closeBlock(node);
    },
    codeBlock: (state, node) => {
      state.write("```" + (node.attrs.params || "") + "\n");
      state.text(node.textContent);
      state.ensureNewLine();
      state.write("```");
      state.closeBlock(node);
    },
    // TODO: verify we can open a real link
    file: (state, node) => {
      state.write(
        `[download file (${node.attrs.fileType}): ${node.attrs.fileName}](${node.attrs.url})`
      );
      state.closeBlock(node);
    },
  },
  {
    em: defaultMarkdownSerializer.marks.em,
    italic: defaultMarkdownSerializer.marks.em,
    strong: defaultMarkdownSerializer.marks.strong,
    bold: defaultMarkdownSerializer.marks.strong,
    link: defaultMarkdownSerializer.marks.link,
    code: defaultMarkdownSerializer.marks.code,
    textHighlight: {
      open: "==",
      close: "==",
      mixable: true,
      expelEnclosingWhitespace: true,
    },
    underline: {
      open: "__",
      close: "__",
      mixable: true,
      expelEnclosingWhitespace: true,
    },
    strike: {
      open: "~~",
      close: "~~",
      mixable: true,
      expelEnclosingWhitespace: true,
    },
  }
);
