import { MarkdownSerializerState } from 'prosemirror-markdown'

declare module 'prosemirror-markdown' {
  interface MarkdownSerializerState {
    inTightList: boolean
    flushClose: (n: number) => void
    closed: { type: { name: string } } | null
  }
} 