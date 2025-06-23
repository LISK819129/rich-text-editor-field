import React from "react";
import FormField from "./FormField.jsx";

function EditableTable(props) {
  const focused = props?.cell?.focused;
  if (focused) {
    return (
      <div>
        <FormField {...props} />
      </div>
    );
  }
  return <div>{props?.value}</div>;
}

export default EditableTable;
