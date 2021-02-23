import React from "react";

export default function FlashMessages(props) {
  return (
    <div className="floating-alerts">
      {props.messeges.map((msg, index) => {
        return (
          <div key={index} className="alert alert-success text-center floating-alert shadow-sm">
            {msg}
          </div>
        );
      })}
    </div>
  );
}
