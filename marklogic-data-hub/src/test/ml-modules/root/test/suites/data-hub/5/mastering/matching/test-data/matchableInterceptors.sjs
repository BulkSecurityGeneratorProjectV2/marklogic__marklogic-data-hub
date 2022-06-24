function baselineQueryInterceptorA(baselineQuery) {
  return cts.andQuery([baselineQuery, cts.collectionQuery("InterceptorA")]);
}

function baselineQueryInterceptorB(baselineQuery) {
  return cts.andQuery(cts.andQueryQueries(baselineQuery).toArray().concat([cts.collectionQuery("InterceptorB")]));
}

function filterQueryInterceptor(filterQuery, docNode) {
  return cts.andQuery([filterQuery, cts.collectionQuery(fn.string(docNode.xpath("envelope/headers/filterCollection")))]);
}

function scoreDocumentInterceptor(defaultScore, contentObjectA, contentObjectB, matchingRulesetDefinitions) {
  let score = 0;
  for (const matchRuleset of matchingRulesetDefinitions) {
    const matchRulesetScore = matchRuleset.score(contentObjectA, contentObjectB);
    if (matchRulesetScore > score) {
      score = matchRulesetScore;
    }
  }
  return score;
}

function customMatchStringInterceptor() {
  //return any atomic value
  return 2;
}

function customMatchSequenceInterceptor() {
  //return any sequence
  let seq = Sequence.from([-1,"abc",3]);
  return seq;
}

function customMatchArrayInterceptor() {
  //return any array
  let arr = [-1,"abc",3];
  return arr;
}

function customLastNameInterceptor(values) {
  return (documentB) => {
    return cts.contains(documentB, values);
  }
}

function customFalseLastNameInterceptor(values) {
    return (documentB) => {
      return !cts.contains(documentB, values);
    }
}

module.exports = {
  baselineQueryInterceptorA,
  baselineQueryInterceptorB,
  filterQueryInterceptor,
  scoreDocumentInterceptor,
  customMatchStringInterceptor,
  customMatchSequenceInterceptor,
  customMatchArrayInterceptor,
  customLastNameInterceptor,
  customFalseLastNameInterceptor
}