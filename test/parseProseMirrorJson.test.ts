import { expect, test, describe } from "bun:test";
import { parseProseMirrorJson } from "../src/parseProseMirrorJson";

describe("parseProseMirrorJson", () => {
  test("converts simple paragraph to markdown", () => {
    const input = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Hello via Bun!",
            },
          ],
        },
      ],
    };

    const expected = "Hello via Bun!";
    expect(parseProseMirrorJson(input)).toBe(expected);
  });

  test("handles empty document", () => {
    const input = {
      type: "doc",
      content: [],
    };

    const expected = "";
    expect(parseProseMirrorJson(input)).toBe(expected);
  });

  test("converts multiple paragraphs", () => {
    const input = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "First paragraph" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Second paragraph" }],
        },
      ],
    };

    const expected = "First paragraph\n\nSecond paragraph";
    expect(parseProseMirrorJson(input)).toBe(expected);
  });

  test("does not add newlines between top level list items", () => {
    const input = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: {
            level: 1,
          },
          content: [
            {
              type: "text",
              text: "Quick Look for Electron",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "This looks hard but there are some resources:",
            },
          ],
        },
        {
          type: "list",
          attrs: {
            kind: "bullet",
            checked: false,
            collapsed: false,
            guid: "eee944c3-7ade-4100-aa45-f1dc35684758",
            archived: true,
          },
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Electron has an api ",
                },
                {
                  type: "text",
                  text: "win.previewFile",
                  marks: [
                    {
                      type: "code",
                      attrs: {},
                    },
                  ],
                },
                {
                  type: "text",
                  text: " which looks related",
                },
              ],
            },
          ],
        },
        {
          type: "list",
          attrs: {
            kind: "bullet",
            checked: false,
            collapsed: false,
            guid: "b4e4e2f6-ba94-4256-a14b-bc99167cb083",
            archived: false,
          },
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Google for ",
                },
                {
                  type: "text",
                  text: "using electron previewFile for macos quicklook",
                  marks: [
                    {
                      type: "code",
                      attrs: {},
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "list",
          attrs: {
            kind: "bullet",
            checked: false,
            collapsed: false,
            guid: "546a3f82-5921-4a29-ba99-f04cf0f26273",
            archived: false,
          },
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "This SO post discusses it",
                  marks: [
                    {
                      type: "link",
                      attrs: {
                        href: "https://github.com/electron/electron/issues/8643",
                        target: null,
                        auto: false,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "list",
          attrs: {
            kind: "bullet",
            checked: false,
            collapsed: false,
            guid: "d14bcd2d-354f-4e95-a41f-ba98202f9612",
            archived: false,
          },
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "So does this one",
                  marks: [
                    {
                      type: "link",
                      attrs: {
                        href: "https://stackoverflow.com/questions/39922582/using-qlpreviewpanel-with-electron",
                        target: null,
                        auto: false,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "list",
          attrs: {
            kind: "bullet",
            checked: false,
            collapsed: false,
            guid: "c5eaba61-429e-4edd-ab73-bd6e0769e158",
            archived: false,
          },
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "This is an example of someone doing it for their electron app",
                  marks: [
                    {
                      type: "link",
                      attrs: {
                        href: "https://github.com/mattermost/desktop/issues/506",
                        target: null,
                        auto: false,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "paragraph",
        },
      ],
      attrs: {
        version: 6.1,
      },
    };

    const expected = `# Quick Look for Electron

This looks hard but there are some resources:
- Electron has an api \`win.previewFile\` which looks related
- Google for \`using electron previewFile for macos quicklook\`
- [This SO post discusses it](https://github.com/electron/electron/issues/8643)
- [So does this one](https://stackoverflow.com/questions/39922582/using-qlpreviewpanel-with-electron)
- [This is an example of someone doing it for their electron app](https://github.com/mattermost/desktop/issues/506)`;
    expect(parseProseMirrorJson(input)).toBe(expected);
  });

  test("should not have double bullet points", () => {
    const input = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: {
            level: 1,
          },
          content: [
            {
              type: "text",
              text: "Sat, February 3rd, 2024",
            },
          ],
        },
        {
          type: "list",
          attrs: {
            kind: "bullet",
            checked: false,
            collapsed: false,
            guid: "5e1ad9f6-18a9-4f21-9e3a-e263fe51e8ec",
            archived: false,
          },
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "backlink",
                  attrs: {
                    id: "a0307696b72841beba529f8e86d8a9f4",
                    label: "Links",
                    graphId: "jackhodkinson",
                  },
                },
              ],
            },
            {
              type: "list",
              attrs: {
                kind: "bullet",
                checked: false,
                collapsed: false,
                guid: "bace09ed-5ddc-4e70-a735-b4f3f8e7ab1b",
                archived: false,
              },
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "backlink",
                      attrs: {
                        id: "link-2761ae5a1b110bce79ccea4d75ba61c4e37494478ff2fc39c1d802eca9c57781",
                        label: "Idea Generation - Sam Altman",
                        graphId: "jackhodkinson",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      attrs: {
        version: 6.1,
      },
    };

    const expected = `# Sat, February 3rd, 2024

- [[Links]]
  - [[Idea Generation - Sam Altman]]`;
    expect(parseProseMirrorJson(input)).toBe(expected);
  });

  test("should handle nested bullets and multiple top level bullets", () => {
    const input = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: {
            level: 1,
          },
          content: [
            {
              type: "text",
              text: "Thu, February 1st, 2024",
            },
          ],
        },
        {
          type: "list",
          attrs: {
            kind: "bullet",
            checked: false,
            collapsed: false,
            guid: "ce7b54ad-fa39-47f9-ae7c-3e42fc3d7391",
            archived: false,
          },
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "backlink",
                  attrs: {
                    id: "a0307696b72841beba529f8e86d8a9f4",
                    label: "Links",
                    graphId: "jackhodkinson",
                  },
                },
              ],
            },
            {
              type: "list",
              attrs: {
                kind: "bullet",
                checked: false,
                collapsed: false,
                guid: "9298255a-5a8f-42ad-a649-8c2fb9372450",
                archived: false,
              },
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "backlink",
                      attrs: {
                        id: "link-2d3fb37ce5c71703b42fabdc8b38f47c0281faf41ff63ea39d9505a4183c79d6",
                        label:
                          "ZeeZide/CodeEditor: A SwiftUI TextEditor with syntax highlighting using Highlight.js",
                        graphId: "jackhodkinson",
                      },
                    },
                  ],
                },
              ],
            },
            {
              type: "list",
              attrs: {
                kind: "bullet",
                checked: false,
                collapsed: false,
                guid: "7b12af79-abf5-4cf9-8258-e096d53e5743",
                archived: false,
              },
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "backlink",
                      attrs: {
                        id: "link-6f5b453c8cb943430672f170d7faff11076e78702291cd2db89e522ae2f2ba8d",
                        label:
                          "Rive - Build interactive animations that run anywhere",
                        graphId: "jackhodkinson",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "list",
          attrs: {
            kind: "bullet",
            checked: false,
            collapsed: false,
            guid: "40e2b353-002d-4a06-8253-d0cc574388b8",
            archived: false,
          },
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Saw some black magic from Ghosty terminal adding native macos tabs into the titlebar of the terminal.",
                },
              ],
            },
          ],
        },
        {
          type: "list",
          attrs: {
            kind: "bullet",
            checked: false,
            collapsed: false,
            guid: "8d4c70e5-3ce0-4508-a3ee-929fc9e7b595",
            archived: false,
          },
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Successfully handled multiple message types. Next up is to have two cells, and update the correct cell!",
                },
              ],
            },
          ],
        },
      ],
      attrs: {
        version: 6.1,
      },
    };

    const expected = `# Thu, February 1st, 2024

- [[Links]]
  - [[ZeeZide/CodeEditor: A SwiftUI TextEditor with syntax highlighting using Highlight.js]]
  - [[Rive - Build interactive animations that run anywhere]]
- Saw some black magic from Ghosty terminal adding native macos tabs into the titlebar of the terminal.
- Successfully handled multiple message types. Next up is to have two cells, and update the correct cell!`;
    expect(parseProseMirrorJson(input)).toBe(expected);
  });
});
