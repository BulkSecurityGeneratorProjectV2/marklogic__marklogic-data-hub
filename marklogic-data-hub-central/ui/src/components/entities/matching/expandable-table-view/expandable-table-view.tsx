import React from "react";
import ProgressBar from "react-bootstrap/ProgressBar";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import styles from "./expandable-table-view.module.scss";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import {HCTable} from "@components/common";

interface Props {
    rowData: any;
    allRuleset: any;
    entityData: any
}

let counter = 0;

const testMatchedUriTableColumns = [
  {
    text: "Ruleset",
    dataField: "ruleName",
    key: "ruleName "+ (counter++),
    width: "40%",
    formatter: (ruleName, key) => (ruleName.map(property => {
      return <span className={styles.rulesetColumn} key={key} aria-label={ruleName}>{property}
      </span>;
    }))
  },
  {
    text: "Exact",
    dataField: "matchedRulesetTypeExact",
    key: "matchedRulesetType" + (counter++) + "exact",
    width: "6%",
    formatter: (matchedRulesetType, row, index) => (row.matchedRulesetType.map(rulesetType => {
      return (rulesetType && rulesetType.toLowerCase() === "exact") && <span className={styles.testMatchedColumns} key={row} aria-label={row.matchedRulesetType + " " + (index)}>
        <FontAwesomeIcon className={styles.checkIcon} icon={faCheck} data-testid={"facet-" + rulesetType} />
      </span>;
    }))
  },
  {
    text: "Synonym",
    dataField: "matchedRulesetTypeSynonym",
    key: "matchedRulesetType " + (counter++) + " synonym",
    width: "8%",
    formatter: (matchedRulesetType, row, index) => (row.matchedRulesetType.map(rulesetType => {
      return (rulesetType && rulesetType.toLowerCase() === "synonym") && <span className={styles.testMatchedColumns} key={row} aria-label={row.matchedRulesetType + " " + (index)}>
        <FontAwesomeIcon className={styles.checkIcon} icon={faCheck} data-testid={"facet-" + rulesetType}/>
      </span>;
    }))
  },
  {
    text: "Double Metaphone",
    dataField: "matchedRulesetTypeMetaphone",
    width: "10%",
    key: "matchedRulesetType " + (counter++) + " metaphone",
    formatter: (matchedRulesetType, row, index) => (row.matchedRulesetType.map(rulesetType => {
      return (rulesetType && rulesetType.toLowerCase() === "double metaphone") && <span className={styles.testMatchedColumns} key={row} aria-label={row.matchedRulesetType + " " + (index)}>
        <FontAwesomeIcon className={styles.checkIcon} icon={faCheck} data-testid={"facet-" + rulesetType}/>
      </span>;
    }))
  },
  {
    text: "Zip",
    dataField: "matchedRulesetTypeZip",
    key: "matchedRulesetType " + (counter++) + " zip",
    width: "6%",
    formatter: (matchedRulesetType, row, index) => (row.matchedRulesetType.map(rulesetType => {
      return (rulesetType && rulesetType.toLowerCase() === "zip") && <span className={styles.testMatchedColumns} key={row} aria-label={row.matchedRulesetType + " " + (index)}>
        <FontAwesomeIcon className={styles.checkIcon} icon={faCheck} data-testid={"facet-" + rulesetType}/>
      </span>;
    }))
  },
  {
    text: "Reduce",
    dataField: "matchedRulesetTypeReduce",
    key: "matchedRulesetType " + (counter++) + " reduce",
    width: "7%",
    formatter: (matchedRulesetType, row, index) => (row.matchedRulesetType.map(rulesetType => {
      return (rulesetType && rulesetType.toLowerCase() === "reduce") && <span className={styles.testMatchedColumns} key={row} aria-label={row.matchedRulesetType + " " + (index)}>
        <FontAwesomeIcon className={styles.checkIcon} icon={faCheck} data-testid={"facet-" + rulesetType}/>
      </span>;
    }))
  },
  {
    text: "Custom",
    dataField: "matchedRulesetTypeCustom",
    key: "matchedRulesetType " + (counter++) + " custom",
    width: "8%",
    formatter: (matchedRulesetType, row, index) => (row.matchedRulesetType.map(rulesetType => {
      return (rulesetType && rulesetType.toLowerCase() === "custom") && <span className={styles.testMatchedColumns} key={row} aria-label={row.matchedRulesetType + " " + (index)}>
        <FontAwesomeIcon className={styles.checkIcon} icon={faCheck} data-testid={"facet-" + rulesetType}/>
      </span>;
    }))
  },
  {
    text: "Match Score",
    dataField: "scores",
    key: "matchedRulesetType " + (counter++) + " score",
    width: "15%",
    formatter: (scores, key) =>  <span key={key}  aria-label={"score " + scores.scores[0]}>
      {scores.scores[0]>0 && <ProgressBar now={scores.scores[0]} label={scores.matchedRule[0] !== "Reduce" ? `${scores.scores[0]}` : `-${scores.scores[0]}`} variant={scores.matchedRule[0] !== "Reduce" ? "success" : "danger"}/>}
    </span>
  }
];

const ExpandableTableView: React.FC<Props> = (props) => {
  const [expandedNestedRows, setExpandedNestedRows] = React.useState([]);
  let allRuleset = props.allRuleset;
  let multipleRuleset=[{}];
  let data = props.entityData.stepArtifact.matchRulesets;
  for (let i=0; i<data.length;i++) {
    let ruleset = data[i];
    if (!ruleset.name.includes(" - ")) {
      multipleRuleset.push(ruleset);
    }
  }
  let localData=[{}];
  let actionPreviewData = props.rowData.matchRulesets.map(matchRulseset => {
    localData=[{ruleName: [""], matchedRulesetType: [""], scores: {scores: [0], matchedRule: [""]}}];
    let matchedRulesetProperty: string[] = [];
    let matchedRulesetType: string[] = [];
    let scores: string[] = [];
    let ruleName: string[] = [];
    let key= counter++;
    let updatedMatchRuleset =  matchRulseset.replace(/([.])/g, " > ");
    ruleName.push(updatedMatchRuleset);
    let ruleset = updatedMatchRuleset.split(" - ");
    if (ruleset.length <2) {
      for (let i=0;i<props.entityData.stepArtifact.matchRulesets.length;i++) {
        let name = props.entityData.stepArtifact.matchRulesets[i].name;
        if (name === ruleset[0]) {
          for (let j=0;j<props.entityData.stepArtifact.matchRulesets[i].matchRules.length;j++) {
            let ruleset=props.entityData.stepArtifact.matchRulesets[i].matchRules[j];
            let entityPropertyPath=[""];
            let matchedRuleset=[""];
            let score=[0];
            score.push(0);
            entityPropertyPath.push(ruleset.entityPropertyPath.replace(/([.])/g, " > "));
            matchedRuleset.push(ruleset.matchType);
            entityPropertyPath.shift();
            matchedRuleset.shift();
            score.shift();
            let data2 = {
              ruleName: entityPropertyPath,
              matchedRulesetType: matchedRuleset,
              key: ruleName + " "+counter++,
              scores: {scores: score, matchedRule: matchedRuleset}
            };
            localData.push(data2);
          }
        }
      }
    }
    localData.shift();
    matchedRulesetProperty.push(ruleset[0]);
    matchedRulesetType.push(ruleset[1]);
    for (let i=0;i<allRuleset.length;i++) {
      if (matchRulseset === allRuleset[i].name) {
        scores.push(allRuleset[i].weight);
      }
    }
    if (localData.length > 0) {
      let data = {
        matchedRulesetProperty: matchedRulesetProperty,
        matchedRulesetType: matchedRulesetType,
        children: localData,
        ruleName: ruleName,
        scores: {scores: scores, matchedRule: matchedRulesetType},
        key: key,
      };
      return data;
    } else {
      let data = {
        matchedRulesetProperty: matchedRulesetProperty,
        matchedRulesetType: matchedRulesetType,
        ruleName: ruleName,
        scores: {scores: scores, matchedRule: matchedRulesetType},
        key: key,
      };
      return data;
    }

  });
  return <div className={styles.expandedTableView}><HCTable columns={testMatchedUriTableColumns}
    data={actionPreviewData}
    pagination={false}
    rowKey="key"
    keyUtil="key"
    baseIndent={10}
    subTableHeader={true}
    showExpandIndicator={true}
    childrenIndent={true}
    nestedParams={{headerColumns: testMatchedUriTableColumns, state: [expandedNestedRows, setExpandedNestedRows]}}
  // id="uriMatchedDataTable"
  />
  <div className={styles.boldTextDisplay}> Total Score: {props.rowData.score}</div></div>;
};
export default ExpandableTableView;
