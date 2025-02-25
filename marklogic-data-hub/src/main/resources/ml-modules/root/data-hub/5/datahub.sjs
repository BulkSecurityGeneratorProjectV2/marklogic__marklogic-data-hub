/*
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

const consts = require("/data-hub/5/impl/consts.sjs");

const Flow = require("/data-hub/5/impl/flow.sjs");
const Perf = require("/data-hub/5/impl/perf.sjs");
const Debug = require("/data-hub/5/impl/debug.sjs");
const defaultConfig = require("/com.marklogic.hub/config.sjs");

class DataHub {

  constructor(config = null){
    if(!config) {
      config = defaultConfig;
    } else {
      config = Object.assign({}, defaultConfig, config);
    }
    this.config = config;

    this.consts = consts;

    this.performance = new Perf(config, this);
    this.flow = new Flow(config);
    this.debug = new Debug(config, this);
    if (this.performance.performanceMetricsOn()) {
      this.performance.instrumentDataHub(this);
    }
  }

}

module.exports = DataHub;
