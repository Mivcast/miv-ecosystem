const test=require('node:test');
const assert=require('node:assert/strict');
const {summarize}=require('../quick-diagnosis.js');
test('unknown answers never become poor scores',()=>{
 assert.deepEqual(summarize([null,null]),{known:0,unknown:2,score:null});
 assert.deepEqual(summarize([2,null]),{known:1,unknown:1,score:100});
 assert.deepEqual(summarize([2,1,0,null]),{known:3,unknown:1,score:50});
});
