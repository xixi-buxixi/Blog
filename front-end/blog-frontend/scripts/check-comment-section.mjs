import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const component = readFileSync(resolve(root, 'src/components/CommentSection.astro'), 'utf8');

assert.match(component, /text-slate-900\s+dark:text-white/, 'comment form text must be readable in light and dark themes');
assert.match(component, /bg-white\/80\s+dark:bg-surface\/50/, 'comment inputs must use a light readable background');
assert.match(component, /let\s+isSubmittingComment\s*=\s*false/, 'top-level comment submit must have an in-flight guard');
assert.match(component, /pendingReplySubmissions/, 'reply submit must have an in-flight guard per parent comment');
assert.match(component, /setElementSubmitting/, 'submit controls must be disabled while a request is in flight');
assert.match(component, /if\s*\(\s*isSubmittingComment\s*\)\s*return/, 'duplicate top-level clicks must return early');
