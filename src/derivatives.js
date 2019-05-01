
/* =================================
General Purpose Derivative Functions
================================== */

const makeRateFromObj = (source, col, numProp, denomProp) => {
  tableau.log("in makeRateFromObj")
  const result = source[col][numProp] / source[col][denomProp]
  
  tableau.log("result: " + result)
  return result
}

const makeSumFromObj = (source, col, ...counts) => {
  tableau.log("in makeSumFromObj ...counts = " + counts)
  const result = counts.reduce((acc, cur) => acc + source[col][cur], 0)
  
  tableau.log("after await -> counts.reduce...: " + result)
  return result
}

const makeSumFromArr = (source, col, ...counts) => {
  tableau.log("in makeSumFromArr ...counts = ")
  const result = source[col].reduce((acc, cur) => counts.reduce((a, b) => acc + a + cur[b], 0), 0)
  
  tableau.log(result)
  return result
}


export {makeRateFromObj, makeSumFromObj, makeSumFromArr}