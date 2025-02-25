import React, {useState, useEffect} from "react";
import {Modal} from "react-bootstrap";
import styles from "./confirmation-modal.module.scss";
import {ModelingMessages} from "@config/tooltips.config";
import {ConfirmationType} from "../../types/common-types";
import {HCAlert, HCButton, HCModal} from "@components/common";

type Props = {
  isVisible: boolean;
  type: ConfirmationType;
  boldTextArray: string[];
  arrayValues?: string[];
  toggleModal: (isVisible: boolean) => void;
  confirmAction: (e?: any) => void;
};

const ConfirmationModal: React.FC<Props> = (props) => {
  const [showSteps, toggleSteps] = useState(false);
  const [showEntities, toggleEntities] = useState(false);
  const [loading, toggleLoading] = useState(false);

  useEffect(() => {
    if (props.isVisible) {
      toggleSteps(false);
      toggleEntities(false);
      toggleLoading(false);
    }
  }, [props.isVisible]);

  const closeModal = () => {
    if (!loading) {
      props.toggleModal(false);
    }
  };

  const renderArrayValues = props.arrayValues?.map((item, index) => <li key={item + index}>{item}</li>);

  const modalFooter = <div className={`text-center ${styles.modalFooter}`}>
    <HCButton
      aria-label={`confirm-${props.type}-no`}
      variant="outline-light"
      onClick={closeModal}
      className={"me-2"}
    >No</HCButton>
    <HCButton
      aria-label={`confirm-${props.type}-yes`}
      variant="primary"
      loading={loading}
      onClick={(e) => {
        switch (props.type) {
        // non async confirm types
        case ConfirmationType.NavigationWarn:
        case ConfirmationType.DiscardChanges:
          break;
        default:
          toggleLoading(true);
          break;
        }
        props.confirmAction(e);
      }}
    >Yes</HCButton>
  </div>;

  const modalFooterClose = <div className={"text-center"}>
    <HCButton
      aria-label={`confirm-${props.type}-close`}
      variant="primary"
      onClick={closeModal}
    >Close</HCButton>
  </div>;

  return (
    <HCModal
      show={props.isVisible}
      data-testid={"confirmation-modal"}
      onHide={closeModal}
    >
      <Modal.Header className={"bb-none"}>
        <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
      </Modal.Header>
      <Modal.Body className={"pt-0 pb-4"}>
        <div className={styles.modalBody}>
          {props.type === ConfirmationType.Identifer && (
            <>
              <p aria-label="identifier-text">Each entity type is allowed a maximum of one identifier. The current identifier is <b>{props.boldTextArray[0]}</b>.
                Choosing a different identifier could affect custom applications and other code that uses <b>{props.boldTextArray[0]}</b> for searching.</p>

              <p>Are you sure you want to change the identifier from <b>{props.boldTextArray[0]}</b> to <b>{props.boldTextArray[1]}</b>?</p>
            </>
          )}

          {(props.type === ConfirmationType.DeleteEntity || props.type === ConfirmationType.DeleteConceptClass) && <p aria-label="delete-text">Permanently delete <b>{props.boldTextArray[0]}</b>?</p>}

          {props.type === ConfirmationType.DeleteEntityRelationshipWarn && (
            <>
              <HCAlert
                className={`mt-2 ${styles.alert}`}
                showIcon
                variant="warning"
              >{"Existing entity type relationships."}</HCAlert>

              <p aria-label="delete-relationship-text">The <b>{props.boldTextArray[0]}</b> entity type is related to one or more entity types. Deleting <b>{props.boldTextArray[0]}</b> will cause
                those relationships to be removed from all involved entity types.</p>
              <p>Are you sure you want to delete the <b>{props.boldTextArray[0]}</b> entity type?</p>
            </>
          )}

          {/* {props.type === ConfirmationType.DeleteEntityRelationshipOutstandingEditWarn && (
            <>
              <HCAlert
                className={styles.alert}
                showIcon
                variant="warning"
              >{"There are existing entity type relationships, and outstanding edits that need to be saved."}</HCAlert>

              <p aria-label="delete-relationship-edit-text">The <b>{props.boldTextArray[0]}</b> entity type is related to one or
                more entity types. Deleting <b>{props.boldTextArray[0]}</b> will cause
                those relationships to be removed from all involved entity types.</p>
              <p>Also, before you can delete the <b>{props.boldTextArray[0]}</b> entity type, all changes to other entity
                types must be saved first, in order to make changes to the whole entity model. This may include updating
                indexes. Changes to the following entity types will be saved if you continue:</p>
              <ul className={styles.stepList}>
                {renderArrayValues}
              </ul>
              <p>OK to save these entity type changes before proceeding with deleting <b>{props.boldTextArray[0]}</b>?</p>
            </>
          )} */}

          {props.type === ConfirmationType.DeleteEntityStepWarn && (
            <>
              <HCAlert
                className={`mt-2 ${styles.alert}`}
                showIcon
                variant="warning"
              >{"Entity type is used in one or more steps."}</HCAlert>

              <p aria-label="delete-step-text">Edit these steps and choose a different entity type before deleting <b>{props.boldTextArray[0]}</b>, to correlate with your changes to this property.</p>
              <p
                aria-label="toggle-steps"
                className={styles.toggleSteps}
                onClick={() => toggleSteps(!showSteps)}
              >{showSteps ? "Hide Steps..." : "Show Steps..."}</p>

              {showSteps && (
                <ul className={styles.stepList}>
                  {renderArrayValues}
                </ul>
              )}
            </>
          )}
          {props.type === ConfirmationType.DeleteEntityWithForeignKeyReferences && (
            <>
              <HCAlert
                className={`mt-2 ${styles.alert}`}
                showIcon
                variant="warning"
              >{"Entity type appears in foreign key relationship in 1 or more other entity types."}</HCAlert>

              <p aria-label="delete-entity-foreign-key-text">Edit the foreign key relationship of these entity types before deleting <b>{props.boldTextArray[0]}</b>.</p>
              <p
                aria-label="toggle-entities"
                className={styles.toggleSteps}
                onClick={() => toggleEntities(!showEntities)}
              >{showEntities ? "Hide Entities in foreign key relationship..." : "Show Entities in foreign key relationship..."}</p>

              {showEntities && (
                <ul className={styles.stepList} data-testid="entitiesWithForeignKeyReferences">
                  {renderArrayValues}
                </ul>
              )}
            </>
          )}

          {props.type === ConfirmationType.DeletePropertyWarn &&
            <p aria-label="delete-property-text"
            >Are you sure you want to delete the <b>{props.boldTextArray[0]}</b> property?</p>
          }

          {props.type === ConfirmationType.PropertyName &&
            <>
              <p aria-label="property-name-text"
              >Entity properties with the name <b>{props.boldTextArray[0]}</b> will not return SQL queries.
             In SQL, <b>{props.boldTextArray[0]}</b> is a special column and therefore, queries on entities titled <b>{props.boldTextArray[0]}</b> will not return meaningful search results.
              </p>
              <p>Are you sure you want to keep <b>{props.boldTextArray[0]}</b> as your property name?</p>
            </>
          }

          {props.type === ConfirmationType.DeleteEntityPropertyWithForeignKeyReferences && (
            <>
              <HCAlert
                className={`mt-2 ${styles.alert}`}
                showIcon
                variant="warning"
              >{"Deleting this property may affect some entities."}</HCAlert>

              <p aria-label="delete-property-foreign-key-text">The property <b>{props.boldTextArray[0]}</b> appears in foreign key relationships in one or more other entity types.</p>
              <p
                aria-label="toggle-entities"
                className={styles.toggleSteps}
                onClick={() => toggleEntities(!showEntities)}
              >{showEntities ? "Hide Entities..." : "Show Entities..."}</p>

              {showEntities && (
                <ul className={styles.stepList} data-testid="entityPropertyWithForeignKeyReferences">
                  {renderArrayValues}
                </ul>
              )}
              <p>Edit the foreign key relationships of these entity types before deleting this property.</p>
            </>
          )}

          {props.type === ConfirmationType.DeletePropertyStepWarn && (
            <>
              <HCAlert
                className={`mt-2 ${styles.alert}`}
                showIcon
                variant="warning"
              >{"Deleting this property may affect some steps."}</HCAlert>

              <p aria-label="delete-property-step-text">The <b>{props.boldTextArray[1]}</b> entity type is used in one or more steps,
                so deleting this property may require editing the steps to make sure this deletion doesn't affect those steps.</p>
              <p
                aria-label="toggle-steps"
                className={styles.toggleSteps}
                onClick={() => toggleSteps(!showSteps)}
              >{showSteps ? "Hide Steps..." : "Show Steps..."}</p>

              {showSteps && (
                <ul className={styles.stepList}>
                  {renderArrayValues}
                </ul>
              )}
              <p>Are you sure you want to delete the <b>{props.boldTextArray[0]}</b> property?</p>
            </>
          )}
          {props.type === ConfirmationType.MissingParameterFunction && (
            <>
              <p aria-label="error-text">Missing <b>getParamaterDefinitions</b> function. Please verify your module file. </p>
            </>
          )}
          {(props.type === ConfirmationType.PublishAll) && (
            <>
              <p aria-label="save-all-text">Are you sure you want to publish your changes to the data model?</p>
              <p className={styles.publishAllText}>{ModelingMessages.saveEntityConfirm}</p>
            </>
          )}
          {(props.type === ConfirmationType.RevertChanges) && (
            <>
              <p aria-label="save-all-text">Are you sure you want to revert all of your unpublished changes?</p>
              <p className={styles.revertChangeText}>{ModelingMessages.revertChangesConfirm}</p>
            </>
          )}
          {props.type === ConfirmationType.NavigationWarn && (
            <>
              <HCAlert
                className={`mt-2 ${styles.alert}`}
                showIcon
                variant="warning"
              >{"Unpublished Changes"}</HCAlert>

              <p aria-label="navigation-warn-text">You have made changes to the properties of one or more entity types.
                If you leave the screen without publishing your changes, they will not be available in the rest of Hub Central.
              </p>

              <p>Are you sure you want to leave the Model screen?</p>
            </>
          )}

          {props.type === ConfirmationType.DeleteStep &&
            <p aria-label="delete-step-text"
            >Are you sure you want to delete the <b>{props.boldTextArray[0]}</b> step?</p>
          }

          {props.type === ConfirmationType.DeleteNotificationRow &&
            <p aria-label="delete-notification-row"
            >Are you sure you want to delete this match notification?</p>
          }

          {/**
            * Confirmation message for adding a step to a flow
            * @param props.boldTextArray[0] = step name
            * @example 'order-ingest'
            * @param props.boldTextArray[1] = flow name
            * @example 'order-flow'
          **/}
          {props.type === ConfirmationType.AddStepToFlow &&
            <p aria-label="add-step-to-flow-text"
            >Are you sure you want to add <b>{props.boldTextArray[0]}</b> to flow <b>{props.boldTextArray[1]}</b>?
            </p>
          }

          {props.type === ConfirmationType.DiscardChanges &&
            <p aria-label="discard-changes-text">Discard Changes?</p>
          }

          {props.type === ConfirmationType.DeleteConceptClassWithRelatedEntityTypes && (
            <>
              <HCAlert
                className={`mt-2 ${styles.alert}`}
                showIcon
                variant="warning"
              >{"Concept class appears to be related to 1 or more entity types."}</HCAlert>

              <p aria-label="delete-concept-class-related-entities-text">Edit the concept relationship of these entity types before deleting <b>{props.boldTextArray[0]}</b>.</p>
              <p
                aria-label="toggle-entities"
                className={styles.toggleSteps}
                onClick={() => toggleEntities(!showEntities)}
              >{showEntities ? "Hide Entities in concept relationship..." : "Show Entities in concept relationship..."}</p>

              {showEntities && (
                <ul className={styles.stepList} data-testid="conceptClassWithRelatedEntityTypes">
                  {renderArrayValues}
                </ul>
              )}
            </>
          )}
        </div>
        {(props.type === ConfirmationType.DeleteEntityStepWarn
          || props.type === ConfirmationType.DeleteEntityWithForeignKeyReferences
          || props.type === ConfirmationType.DeleteEntityPropertyWithForeignKeyReferences
          || props.type === ConfirmationType.DeleteConceptClassWithRelatedEntityTypes) ? modalFooterClose : modalFooter}
      </Modal.Body>
    </HCModal>
  );
};

export default ConfirmationModal;
