import * as Y from "yjs";

/**
 * yjsSync.js — lightweight CRDT text-sync helper.
 *
 * We don't use a rich-text editor binding library (like y-codemirror);
 * instead we bind Yjs directly to our plain <textarea>-based CodeEditor
 * using a classic "diff the whole string" technique:
 *   1. On local typing, compute the common prefix/suffix between the old
 *      and new text to find the minimal delete+insert operation.
 *   2. Apply that operation to the shared Y.Text inside a transaction.
 *   3. Yjs automatically generates a compact binary "update" for that
 *      transaction, which we relay to other clients over Socket.io.
 *   4. Remote updates are applied with a special "remote" origin so we
 *      don't re-broadcast them right back out (no echo loops).
 *
 * This gives real CRDT conflict resolution — concurrent edits from two
 * people merge correctly without one person's changes overwriting the
 * other's, unlike a naive "just send the whole string" sync.
 */

export function diffAndApply(ytext, oldStr, newStr) {
  if (oldStr === newStr) return;

  let start = 0;
  const maxStart = Math.min(oldStr.length, newStr.length);
  while (start < maxStart && oldStr[start] === newStr[start]) start++;

  let oldEnd = oldStr.length;
  let newEnd = newStr.length;
  while (oldEnd > start && newEnd > start && oldStr[oldEnd - 1] === newStr[newEnd - 1]) {
    oldEnd--;
    newEnd--;
  }

  const deleteLength = oldEnd - start;
  const insertText = newStr.slice(start, newEnd);

  ytext.doc.transact(() => {
    if (deleteLength > 0) ytext.delete(start, deleteLength);
    if (insertText.length > 0) ytext.insert(start, insertText);
  });
}

export function uint8ToBase64(u8) {
  let binary = "";
  for (let i = 0; i < u8.length; i++) binary += String.fromCharCode(u8[i]);
  return btoa(binary);
}

export function base64ToUint8(b64) {
  const binary = atob(b64);
  const u8 = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) u8[i] = binary.charCodeAt(i);
  return u8;
}

export { Y };
