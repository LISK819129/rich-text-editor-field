import React from "react";
import FormField from "./FormField.jsx";

function Card(props) {
  return (
    <div>
      <FormField {...props} />
    </div>
  );
}

export default Card;
