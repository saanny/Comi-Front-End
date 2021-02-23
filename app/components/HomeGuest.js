import React, { useState, useEffect, useContext } from "react";
import Page from "./Page";
import Axios from "axios";
import { useImmerReducer } from "use-immer";
import { CSSTransition } from "react-transition-group";
import DispatchContext from "../DispatchContext";

export default function HomeGuest() {
  const appDispatch = useContext(DispatchContext);
  const initialState = {
    username: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0
    },
    email: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0
    },
    password: {
      value: "",
      hasErrors: false,
      message: ""
    },
    submitCount: 0
  };
  const reducer = (draft, action) => {
    switch (action.type) {
      case "usernameImmediately":
        draft.username.hasErrors = false;
        draft.username.value = action.value;

        if (draft.username.value.length > 30) {
          draft.username.hasErrors = true;
          draft.username.message = "username cannot excessd 30 characters";
        }

        if (draft.username.value && !/^([a-zA-Z0-9]+)$/.test(draft.username.value)) {
          draft.username.hasErrors = true;
          draft.username.message = "username can only contain letters and numbers";
        }

        break;
      case "usernameAfterDelay":
        if (draft.username.value.length < 3) {
          draft.username.hasErrors = true;
          draft.username.message = "username must be at least 3 characters";
        }
        if (!draft.username.hasErrors && !action.noRequest) {
          draft.username.checkCount++;
        }
        break;
      case "usernameUniqueResults":
        if (action.value) {
          draft.username.hasErrors = true;
          draft.username.isUnique = false;
          draft.username.message = `نام کاربری ${draft.username.value} قبلا ثبت شده هست`;
        } else {
          draft.username.isUnique = true;
        }
        break;
      case "emailImmediately":
        draft.email.hasErrors = false;
        draft.email.value = action.value;
        break;
      case "emailAfterDelay":
        if (!/^\S+@\S+$/.test(draft.email.value)) {
          draft.email.hasErrors = true;
          draft.email.message = "شما باید یک ایمیل معتبر وارد کنید";
        }
        if (!draft.email.hasErrors && !action.noRequest) {
          draft.email.checkCount++;
        }
        break;
      case "emailUniqueResults":
        if (action.value) {
          draft.email.hasErrors = true;
          draft.email.isUnique = false;
          draft.email.message = `ایمیل ${draft.email.value} قبلا ثبت شده هست`;
        } else {
          draft.email.isUnique = true;
        }
        break;
      case "passwordImmediately":
        draft.password.hasErrors = false;
        draft.password.value = action.value;
        if (draft.password.value.length > 50) {
          draft.password.hasErrors = true;
          draft.password.message = "کلمه عبور باید کمتر از 50 کاراکتر باشد";
        }
        break;
      case "passwordAfterDelay":
        if (draft.password.value.length < 12) {
          draft.password.hasErrors = true;
          draft.password.message = "کلمه عبور باید بیشتر از 12 کاراکتر باشد";
        }
        break;
      case "submitForm":
        if (!draft.username.hasErrors && draft.username.isUnique && !draft.email.hasErrors && draft.email.isUnique && !draft.password.hasErrors) {
          draft.submitCount++;
        }
        break;
    }
  };

  const [state, dispatch] = useImmerReducer(reducer, initialState);

  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(() => dispatch({ type: "usernameAfterDelay" }), 800);
      return () => clearTimeout(delay);
    }
  }, [state.username.value]);

  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(() => dispatch({ type: "emailAfterDelay" }), 800);
      return () => clearTimeout(delay);
    }
  }, [state.email.value]);

  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(() => dispatch({ type: "passwordAfterDelay" }), 800);
      return () => clearTimeout(delay);
    }
  }, [state.password.value]);

  useEffect(() => {
    const request = Axios.CancelToken.source();
    if (state.username.checkCount) {
      const fetchResults = async () => {
        try {
          const response = await Axios.post(
            "/doesUsernameExist",
            {
              username: state.username.value
            },
            {
              token: request.token
            }
          );
          dispatch({ type: "usernameUniqueResults", value: response.data });
        } catch (error) {
          console.log("there was problem  or the request was cancelled");
        }
      };
      fetchResults();
      return () => request.cancel;
    }
  }, [state.username.checkCount]);

  useEffect(() => {
    const request = Axios.CancelToken.source();
    if (state.email.checkCount) {
      const fetchResults = async () => {
        try {
          const response = await Axios.post(
            "/doesEmailExist",
            {
              email: state.email.value
            },
            {
              token: request.token
            }
          );
          dispatch({ type: "emailUniqueResults", value: response.data });
        } catch (error) {
          console.log("there was problem  or the request was cancelled");
        }
      };
      fetchResults();
      return () => request.cancel;
    }
  }, [state.email.checkCount]);

  useEffect(() => {
    const request = Axios.CancelToken.source();
    if (state.submitCount) {
      const fetchResults = async () => {
        try {
          const response = await Axios.post(
            "/register",
            {
              username: state.username.value,
              email: state.email.value,
              password: state.password.value
            },
            {
              token: request.token
            }
          );
          appDispatch({ type: "login", data: response.data });
          appDispatch({ type: "flashMesseges", value: "شما با موفقیت ثبت نام شدید" });
        } catch (error) {
          console.log("there was problem  or the request was cancelled");
        }
      };
      fetchResults();
      return () => request.cancel;
    }
  }, [state.submitCount]);

  const handleSubmit = e => {
    e.preventDefault();
    dispatch({ type: "usernameImmediately", value: state.username.value });
    dispatch({ type: "usernameAfterDelay", value: state.username.value, noRequest: true });
    dispatch({ type: "emailImmediately", value: state.email.value });
    dispatch({ type: "emailAfterDelay", value: state.email.value, noRequest: true });
    dispatch({ type: "passwordImmediately", value: state.password.value });
    dispatch({ type: "passwordAfterDelay", value: state.password.value });
    dispatch({ type: "submitForm" });
  };

  return (
    <Page title="Home" wide={true}>
      <div className="row align-items-center">
        <div className="col-lg-7 py-3 py-md-5">
          <h1 className="display-3">Remember Writing?</h1>
          <p className="lead text-muted">Are you sick of short tweets and impersonal &ldquo;shared&rdquo; posts that are reminiscent of the late 90&rsquo;s email forwards? We believe getting back to actually writing is the key to enjoying the internet again.</p>
        </div>
        <div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username-register" className="text-muted mb-1">
                <small>Username</small>
              </label>
              <input onChange={e => dispatch({ type: "usernameImmediately", value: e.target.value })} id="username-register" name="username" className="form-control" type="text" placeholder="Pick a username" autoComplete="off" />
              <CSSTransition in={state.username.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.username.message}</div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="email-register" className="text-muted mb-1">
                <small>Email</small>
              </label>
              <input onChange={e => dispatch({ type: "emailImmediately", value: e.target.value })} id="email-register" name="email" className="form-control" type="text" placeholder="you@example.com" autoComplete="off" />
              <CSSTransition in={state.email.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.email.message}</div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="password-register" className="text-muted mb-1">
                <small>Password</small>
              </label>
              <input onChange={e => dispatch({ type: "passwordImmediately", value: e.target.value })} id="password-register" name="password" className="form-control" type="password" placeholder="Create a password" />
              <CSSTransition in={state.password.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.password.message}</div>
              </CSSTransition>
            </div>
            <button type="submit" className="py-3 mt-4 btn btn-lg btn-success btn-block">
              Sign up for ComplexApp
            </button>
          </form>
        </div>
      </div>
    </Page>
  );
}
