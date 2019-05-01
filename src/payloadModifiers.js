// function from lodash for allowing us to combine parallel arrays into a single 'table'
import zip from "lodash.zip";

const augmentDumpNZip = (source, ...pushers) => {
  let keys_    = Object.keys(source[0]);
  let wk1_vals = Object.values(source[0]);
  let wk2_vals = Object.values(source[1]);
  let wk3_vals = Object.values(source[2]);
  
  let wks = [wk1_vals, wk2_vals, wk3_vals]
  
  return zip(
    pushers.reduce((acc, pusher) => acc.concat(pusher.name), keys_),
    // pusher handles a single week
    ...wks.map( (wk, i) => wk.concat(pushers.map( p => p.pusher(source, i)))));
}

const createDumpNZIP = (source, ...pushers) => {
  
  return zip(
    pushers.map( pusher => pusher.name), // keys
    ...[[],[],[]].map( (wk, i) => wk.concat(pushers.map( p => p.pusher(source, i)))))
}

const dumpNZIP = source => {
  let keys_    = Object.keys(source[0]);
  let wk1_vals = Object.values(source[0]);
  let wk2_vals = Object.values(source[1]);
  let wk3_vals = Object.values(source[2]);

  return zip(keys_, wk1_vals, wk2_vals, wk3_vals)
}
export {dumpNZIP, augmentDumpNZip, createDumpNZIP}