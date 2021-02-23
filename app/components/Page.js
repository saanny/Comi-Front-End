import React, { useEffect } from "react";
import Container from "./Container";
export default function Page(props) {
  useEffect(() => {
    document.title = `${props.title} | complexApp`;
    window.scrollTo(0, 0);
  }, [props.title]);
  return <Container wide={props.wide}>{props.children}</Container>;
}
