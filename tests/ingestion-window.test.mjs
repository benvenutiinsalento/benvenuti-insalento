import test from 'node:test';
import assert from 'node:assert/strict';
import { candidateWindow } from '../netlify/functions/_shared/ingestion.mjs';

test('lotti successivi non perdono candidati oltre il limite',()=>{
 const candidates=Array.from({length:1805},(_,i)=>i);
 const first=candidateWindow(candidates,0,800);
 const second=candidateWindow(candidates,first.nextCursor,800);
 const third=candidateWindow(candidates,second.nextCursor,800);
 assert.equal(first.items.length,800);
 assert.equal(second.items[0],800);
 assert.equal(third.items.at(-1),1804);
 assert.equal(third.nextCursor,0);
 assert.equal(third.remaining,0);
});
