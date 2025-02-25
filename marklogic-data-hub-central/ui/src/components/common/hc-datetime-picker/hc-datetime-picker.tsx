import React from "react";
import dayjs from "dayjs";
import DateRangePicker from "react-bootstrap-daterangepicker";
import {Options, DateOrString} from "daterangepicker";
import "bootstrap-daterangepicker/daterangepicker.css";
import {Calendar4, XLg} from "react-bootstrap-icons";
import styles from "./hc-datetime-picker.module.scss";

interface HCDateTimePickerProps extends Options {
    name: string;
    time?: boolean;
    placeholder?: string | Array<string>;
    className?: string;
    value?: any;
    format?: string;
    onChange?: (startDate?: DateOrString, endDate?: DateOrString) => void;
    bindChange?: (startDate?: DateOrString, endDate?: DateOrString) => void;
    onOk?: (picker, element) => void;
    parentEl?: string;
}

function formatPlaceHolder(input) {
  return Array.isArray(input) && input.length > 1 ? input.map(text => text.length > 15 ? text.slice(0, 15) + "..." : text).join(" ~ ") : input;
}

function formatValue(input, {format, time}: { format?: string, time?: boolean}) {
  if (!Array.isArray(input) || input.length !== 2) {
    return "";
  }

  if (input.some(dateValue => dateValue === null)) {
    return "";
  }

  let dateFormat = format || (time ? "YYYY-MM-DD HH:mm:ss" : "YYYY-MM-DD");

  return input.map(dateValue => dayjs(dateValue).format(dateFormat)).join(" ~ ");
}

function HCDateTimePicker({time, name, className, value, format, placeholder = ["Start date", "End date"], onChange, onOk, bindChange,  ...props}: HCDateTimePickerProps) {
  const initialSettings: Options = {
    ...props,
    autoApply: true,
  };
  const [showClear, updateShowClear] = React.useState(false);
  const ref = React.useRef<any>();

  function onShow(event, picker) {
    const applyButton = document.querySelector(".applyBtn");

    if (applyButton) {
      applyButton.innerHTML = "OK";
    }
  }

  function resetValue(event) {
    event.preventDefault();
    event.stopPropagation();

    if (ref.current) {
      ref.current.setStartDate(undefined);
      ref.current.setEndDate(undefined);
    }

    if (onChange) {
      updateShowClear(false);
      return onChange();
    }

    if (onOk && bindChange) {
      updateShowClear(false);
      bindChange();
      return;
    }
  }

  function handleMouseOver(e) {
    if (value.length > 0 && value[0]) {
      updateShowClear(true);
    }
  }

  function handleMouseOut() {
    if (value.length > 0 && value[0]) {
      updateShowClear(false);
    }
  }

  if (time) {
    initialSettings.timePicker = true;
  }

  return  (
    <DateRangePicker initialSettings={initialSettings} {...{onShow, ref}} onCallback={onChange} onApply={onOk}>
      <div className={`${className || ""} ${styles.pickerContainer}`} id="date-picker-container" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
        <input data-testid={name} readOnly id={name} placeholder={formatPlaceHolder(placeholder)} className={styles.input} value={formatValue(value, {format, time})} />
        {!showClear ? <Calendar4 className={`${styles.calendarIcon}`} /> :
          <XLg className={`${styles.clearIcon}`} onClick={resetValue} data-testid="datetime-picker-reset"/>}
      </div>
    </DateRangePicker>
  );
}

export default HCDateTimePicker;