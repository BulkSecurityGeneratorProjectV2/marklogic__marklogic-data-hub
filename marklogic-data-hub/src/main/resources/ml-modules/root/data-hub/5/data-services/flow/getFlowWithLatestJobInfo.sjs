'use strict';

/**
 Copyright (c) 2021 MarkLogic Corporation

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
'use strict';

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/read-flow", "execute");

const config = require("/com.marklogic.hub/config.sjs");
const hubUtils = require("/data-hub/5/impl/hub-utils.sjs");

var name;

let flowWithStepDetails = require('./flow-lib.sjs').getFlowsWithStepDetails(name);
fn.head(hubUtils.invokeFunction(function() {
  flowWithStepDetails["steps"].forEach((step) => {
    const jobQueries = [];
    jobQueries.push(cts.collectionQuery('Job'));
    jobQueries.push(cts.jsonPropertyValueQuery("flow",flowWithStepDetails.name));
    jobQueries.push(cts.jsonPropertyValueQuery("stepName",step.stepName));
    //A flow may contain same step more then once. 'status' in step response always contains step number
    // jobQueries.push(cts.jsonPropertyWordQuery("status",step.stepNumber));

    let latestJob = fn.head(fn.subsequence(cts.search(cts.andQuery(jobQueries),[cts.indexOrder(cts.jsonPropertyReference("timeStarted"), "descending")]), 1, 1));
    if(latestJob) {
      latestJob = latestJob.toObject();
      let stepRunResponses = latestJob.job.stepResponses;
      if (stepRunResponses && hubUtils.getObjectValues(stepRunResponses).length > 0) {
        let stepRunResponse = hubUtils.getObjectValues(stepRunResponses).find(
          (el) => el.stepName === step.stepName
        );
        if (stepRunResponse) {
          step.jobId = latestJob.job.jobId;
          step.lastRunStatus = stepRunResponse.status;
          step.stepEndTime = stepRunResponse.stepEndTime;
        }
      }
    }
  });
}, config.JOBDATABASE));
flowWithStepDetails;
