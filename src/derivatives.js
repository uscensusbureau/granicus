
/* =================================
General Purpose Derivative Functions
================================== */

const makeRateFromObj = (source, col, numProp, denomProp) => {
  console.log("in makeRateFromObj")
  const result = source[col][numProp] / source[col][denomProp]
  
  console.log("result: " + result)
  return result
}

const makeSumFromObj = (source, col, ...counts) => {
  console.log("in makeSumFromObj ...counts = " + counts)
  const result = counts.reduce((acc, cur) => acc + source[col][cur], 0)
  
  console.log("after await -> counts.reduce...: " + result)
  return result
}

const makeSumFromArr = (source, col, ...counts) => {
  console.log("in makeSumFromArr ...counts = ")
  const result = source[col].reduce((acc, cur) => counts.reduce((a, b) => acc + a + cur[b], 0), 0)
  
  console.log(result)
  return result
}


export {makeRateFromObj, makeSumFromObj, makeSumFromArr}