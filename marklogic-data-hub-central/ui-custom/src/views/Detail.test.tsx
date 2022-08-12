import Detail from "./Detail";
import {BrowserRouter as Router} from "react-router-dom";
import {render, act} from "@testing-library/react";
import {UserContext} from "../store/UserContext";
import {DetailContext} from "../store/DetailContext";
import _ from "lodash";
//import config from '../../../src/main/resources/explore-data/ui-config/config.json';

// TODO temporarily use custom config without relationships to avoid visjs graph breaking
const config = {
    "detail": {
        "entities": {
            "person": {
                "heading": {
                    "id": "result[0].extracted.person.personId",
                    "title": {
                        "component": "Value",
                        "config": {
                            "path": "result[0].extracted.person.name"
                        }
                    }
                },
                "info": {
                    "title": "Personal Data",
                    "items": [
                        {
                            "component": "DataTableValue",
                            "config": {
                                "id": "phone",
                                "title": "Phone Number",
                                "path": "result[0].extracted.person.phone"
                            }
                        }
                    ]
                }
            }
        }
    }
}

const configCustomEntity = _.cloneDeep(config);
configCustomEntity.detail['entityType'] = {"path": "entityTypeCustom"};

const detail = {
    "result": [
        {
            "extracted": {
                "person": {
                    "id": "10001",
                    "name": ["John Doe"],
                    "phone": ["123-456-7890"]
                }
            }
        }
    ],
    "entityType": "person",
    "uri": "/person/10001.xml"

};

const detailCustomEntity = _.cloneDeep(detail);
delete detailCustomEntity['entityType'];
detailCustomEntity['entityTypeCustom'] = "person"; // For testing custom entity definition (not "entityType")

const EXPANDIDS = {
    membership: true,
    info: true,
    relationships: true,
    imageGallery: true,
    timeline: true
}

const detailContextValue = {
    detail: detail,
    recentRecords: [],
    loading: false,
    expandIds: EXPANDIDS,
    handleGetDetail: jest.fn(),
    handleGetRecent: jest.fn(),
    handleGetRecentLocal: jest.fn(),
    handleSaveRecent: jest.fn(),
    handleSaveRecentLocal: jest.fn(),
    handleExpandIds: jest.fn(),
    handleDeleteAllRecent: jest.fn(), 
    hasSavedRecords: jest.fn()
};

const detailContextValueCustomEntity = {...detailContextValue, detail: detailCustomEntity};

const userContextValue = {
    userid: "",
    loginAddress: "",
    config: config,
    handleGetLoginAddress: jest.fn(),
    handleGetUserid: jest.fn(),
    handleLogin: jest.fn(),
    handleGetConfig: jest.fn()
};

const userContextValueEmptyConfig = {...userContextValue, config: {}};

const userContextValueCustomEntity = {...userContextValue, config: configCustomEntity};

describe("Detail view", () => {

    test("Renders configured content with non-empty config", async () => {
        let getByText;
        await act(async () => {
            const renderResults = render(
                <Router>
                    <UserContext.Provider value={userContextValue}>
                        <DetailContext.Provider value={detailContextValue}>
                            <Detail />
                        </DetailContext.Provider>
                    </UserContext.Provider>
                </Router>
            );
            getByText = renderResults.getByText;
        });
        expect(document.querySelector(".heading")).toBeInTheDocument();
        expect(getByText(detail.result[0].extracted.person.name[0])).toBeInTheDocument();
        expect(getByText(config.detail.entities.person.info.items[0].config.title)).toBeInTheDocument();
    });

    test("Renders loading content with empty config", async () => {
        await act(async () => {
            const renderResults = render(
                <Router>
                    <UserContext.Provider value={userContextValueEmptyConfig}>
                        <DetailContext.Provider value={detailContextValue}>
                            <Detail />
                        </DetailContext.Provider>
                    </UserContext.Provider>
                </Router>
            );
        });
        expect(document.querySelector(".loading")).toBeInTheDocument();
    });

    test("Renders configured content when custom entity path defined", async () => {
        let getByText;
        await act(async () => {
            const renderResults = render(
                <Router>
                    <UserContext.Provider value={userContextValueCustomEntity}>
                        <DetailContext.Provider value={detailContextValueCustomEntity}>
                            <Detail />
                        </DetailContext.Provider>
                    </UserContext.Provider>
                </Router>
            );
            getByText = renderResults.getByText;
        });
        expect(document.querySelector(".heading")).toBeInTheDocument();
        expect(getByText(detail.result[0].extracted.person.name[0])).toBeInTheDocument();
        expect(getByText(config.detail.entities.person.info.items[0].config.title)).toBeInTheDocument();
    });

});