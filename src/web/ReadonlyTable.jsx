import React from "react";
import FormField from "./FormField.jsx";

function ReadonlyTable(props) {
  return (
    <div>
      <FormField {...props} />
    </div>
  );
}

export default ReadonlyTable;
