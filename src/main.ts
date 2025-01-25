import { parseProseMirrorJson } from "./parseProseMirrorJson";
import { z } from "zod";

// Get the input file path from command line arguments
const inputPath = process.argv[2];

if (!inputPath) {
  console.error("Please provide an input JSON file path");
  process.exit(1);
}

const noteSchema = z.object({
  document_json: z.string(),
  id: z.string(),
  subject: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  edited_at: z.string().nullable(),
  daily_at: z.string().nullable(),
  backlinked_count: z.number(),
});

type Note = z.infer<typeof noteSchema>;

type ParsedNote = Note & {
  markdown: string;
};

const file = await Bun.file(inputPath).text();
const jsonData = JSON.parse(file);

// Validate that jsonData.notes is an array
const notesArray = z.array(noteSchema).safeParse(jsonData.notes);

if (!notesArray.success) {
  console.error("Invalid notes data:", notesArray.error);
  process.exit(1);
}

const parsedNotes: ParsedNote[] = [];

// Function to properly escape and encode CSV fields
function escapeCsvField(value: string | number | null): string {
  if (value === null) return '""';
  if (typeof value === "number") return value.toString();

  // Replace any double quotes with two double quotes
  const escaped = value.replace(/"/g, '""');
  // Replace any non-printable characters with their Unicode escape sequence
  const sanitized = escaped.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
  return `"${sanitized}"`;
}

// loop over notes and parse them
for (let i = 0; i < notesArray.data.length; i++) {
  const note = notesArray.data[i];
  if (!note) break;

  let prosemirrorJson;
  try {
    prosemirrorJson = JSON.parse(note.document_json);
  } catch (e) {
    console.error(
      `Failed to parse document_json for note ${note.document_json}`
    );
    throw e;
  }

  let markdown = "";
  try {
    markdown = parseProseMirrorJson(prosemirrorJson);
  } catch (e) {
    console.error(
      `Failed to parse document_json for note ${note.document_json}`
    );

    throw e;
  }

  if (markdown.trim().length > 1) {
    await Bun.write(`./notes/${note.id}.md`, markdown);
  }
}

// Write to CSV with BOM for Excel compatibility
const BOM = "\ufeff";
const csvHeader =
  "id,subject,created_at,updated_at,edited_at,daily_at,backlinked_count,document_json\n";
const csvRows = parsedNotes
  .map((note) => {
    return [
      escapeCsvField(note.id),
      escapeCsvField(note.subject),
      escapeCsvField(note.created_at),
      escapeCsvField(note.updated_at),
      escapeCsvField(note.edited_at),
      escapeCsvField(note.daily_at),
      escapeCsvField(note.backlinked_count),
      escapeCsvField(note.document_json),
    ].join(",");
  })
  .join("\n");

const csvContent = BOM + csvHeader + csvRows;
await Bun.write(
  "./notes/parsed_notes.csv",
  new TextEncoder().encode(csvContent)
);

console.log(
  `Successfully parsed ${parsedNotes.length} notes and saved to parsed_notes.csv`
);
