import { parseProseMirrorJson } from "./parseProseMirrorJson";

// Get the input file path from command line arguments
const inputPath = process.argv[2];

if (!inputPath) {
  console.error("Please provide an input JSON file path");
  process.exit(1);
}

const file = await Bun.file(inputPath).text();
const jsonData = JSON.parse(file);

// loop over 100 examples, print them, and save to file
// TODO: handle errors and save in a better format
for (let i = 0; i < 100; i++) {
  const note = jsonData.notes[i];
  const prosemirrorJson = JSON.parse(note.document_json);
  let markdown = "";
  try {
    markdown = parseProseMirrorJson(prosemirrorJson);
  } catch (e) {
    console.log(`skipping ${i}`);
    continue;
  }
  if (markdown.trim().length > 1) {
    console.log(JSON.stringify(JSON.parse(note.document_json), null, 2));
    console.log("---");
    console.log(markdown);
    console.log("===");
    await Bun.write(`./notes/${i}.md`, markdown);
  }
}
