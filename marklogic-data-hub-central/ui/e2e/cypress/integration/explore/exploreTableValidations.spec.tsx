/// <reference types="cypress"/>

import browsePage from "../../support/pages/browse";
import {Application} from "../../support/application.config";
import "cypress-wait-until";
import {toolbar} from "../../support/components/common";
import LoginPage from "../../support/pages/login";
import entitiesSidebar from "../../support/pages/entitiesSidebar";
import table from "../../support/components/common/tables";

describe("Validate table and column selector in explore", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    //Saving Local Storage to preserve session
    cy.saveLocalStorage();
  });
  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    cy.restoreLocalStorage();
  });
  after(() => {
    cy.resetTestUser();
    cy.waitForAsyncRequest();
  });
  it("Navigate to Explore", () => {
    cy.waitUntil(() => toolbar.getExploreToolbarIcon()).click();
    browsePage.getTableView().click();
    browsePage.waitForSpinnerToDisappear();
    browsePage.waitForHCTableToLoad();
  });
  it("Validate the table and expandable rows", () => {
    browsePage.getTotalDocuments().should("be.greaterThan", 25);
    browsePage.getHCTableRows().should("have.length", 20);
    table.getTableColumns().should("be.visible");
    browsePage.getExpandable().should("be.visible");
  });
  it("Validate columns selector popover, draggable titles and checkable titles", () => {
    entitiesSidebar.openBaseEntityDropdown();
    entitiesSidebar.selectBaseEntityOption("Customer");
    browsePage.waitForSpinnerToDisappear();
    browsePage.getColumnSelectorIcon().should("be.visible");
    browsePage.getColumnSelectorIcon().click({force: true});
    browsePage.getColumnSelector().should("be.visible");
    browsePage.getTreeItem(2).should("have.class", "rc-tree-treenode-draggable").should("have.class", "rc-tree-treenode-checkbox-checked");
  });
});

