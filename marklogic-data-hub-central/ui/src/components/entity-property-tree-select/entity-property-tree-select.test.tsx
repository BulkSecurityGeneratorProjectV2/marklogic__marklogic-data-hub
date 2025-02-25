import React from "react";
import {render} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import EntityPropertyTreeSelect from "./entity-property-tree-select";
import {customerEntityDef} from "../../assets/mock-data/curation/entity-definitions-mock";
import {definitionsParser} from "../../util/data-conversion";

const customerEntityDefsArray = definitionsParser(customerEntityDef[0]["entityModel"].definitions);
const entityTypeDefinition = customerEntityDefsArray.find(entityDefinition => entityDefinition.name === "Customer");

describe("Entity Property Tree Select component", () => {
  it("can render and can select a value", () => {
    const mockOnValueSelected = jest.fn();

    const {getByText} =  render(
      <EntityPropertyTreeSelect
        isForMerge={false}
        propertyDropdownOptions={entityTypeDefinition?.properties || []}
        entityDefinitionsArray={customerEntityDefsArray}
        value={undefined}
        onValueSelected={mockOnValueSelected}
      />
    );

    userEvent.click(getByText("Select property"));
    userEvent.click(getByText("customerId"));
    expect(mockOnValueSelected.mock.calls[0][0]).toBe("customerId");
  });
  it("should render custom aria label when pass identifier prop", () => {
    const mockOnValueSelected = jest.fn();
    const customIdentifier = "customIdentifier";

    const {getAllByLabelText} =  render(
      <EntityPropertyTreeSelect
        isForMerge={false}
        propertyDropdownOptions={entityTypeDefinition?.properties || []}
        entityDefinitionsArray={customerEntityDefsArray}
        value={undefined}
        onValueSelected={mockOnValueSelected}
        identifier={customIdentifier}
      />
    );

    expect(getAllByLabelText(`${customIdentifier}-property-to-match-dropdown`)[0]).toBeInTheDocument();
  });
});
