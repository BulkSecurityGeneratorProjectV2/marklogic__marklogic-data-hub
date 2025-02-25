import {Application} from "../../support/application.config";
import {toolbar} from "../../support/components/common";
import browsePage from "../../support/pages/browse";
import LoginPage from "../../support/pages/login";
import detailPage from "../../support/pages/detail";

describe("Test graph export to png", () => {
  before(() => {
    cy.visit("/");
    cy.contains(Application.title);

    cy.log("**Logging into the app as a developer**");
    cy.loginAsDeveloper().withRequest();
    LoginPage.postLogin();
    //Saving Local Storage to preserve session
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    //Restoring Local Storage to Preserve Session
    cy.restoreLocalStorage();
  });

  afterEach(() => {
    // update local storage
    cy.saveLocalStorage();
  });

  it("Validate existing relationships for a record", () => {
    cy.log("**Go to Explore section**");
    toolbar.getExploreToolbarIcon().click();
    browsePage.getTableView().click();

    cy.log("**Go to Detail page**");
    browsePage.getDetailInstanceViewIcon("101").scrollIntoView().should("be.visible").click();

    cy.log("**Switch to Relationships tab**");
    detailPage.getRelationshipsView().should("exist").click();
    detailPage.getRelatedEntitiesTitle().should("exist");
    detailPage.getRelatedConceptsTitle().should("exist");

    cy.log("**Expand entities groups**");
    detailPage.getExpandBtn().should("exist").click();
    detailPage.getRelationItems().should("have.length.greaterThan", 0);
  });
  it("Validate there are no relationships for a record", () => {
    cy.log("**Go to Explore section**");
    toolbar.getExploreToolbarIcon().click();
    browsePage.getTableView().click();

    cy.log("**Go to Detail page**");
    browsePage.getDetailInstanceViewIcon("90").scrollIntoView().should("be.visible").click();

    cy.log("**Check Relationships tab**");
    detailPage.getRelationshipsView().should("not.exist");
  });

});