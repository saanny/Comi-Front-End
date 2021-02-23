import React from "react";
import Page from "./Page";
import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <Page title="Not Found">
      <div className="text-center">
        <h2>whoops, we cannot find that page</h2>
        <p className="lead text-muted">
          {" "}
          you can always visit <Link to="/">Hom page</Link> to get a fresh start
        </p>
      </div>
    </Page>
  );
}
