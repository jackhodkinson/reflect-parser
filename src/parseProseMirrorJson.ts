import { customSchema } from "./custom-schema";
import { customMarkdownSerializer } from "./custom-serializer";
import { Node } from "prosemirror-model";

export const parseProseMirrorJson = (json: any) => {
  const doc = Node.fromJSON(customSchema, json);
  return customMarkdownSerializer.serialize(doc, { tightLists: true });
};
