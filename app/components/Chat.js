import React, { useContext, useEffect, useRef } from "react";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import { useImmer } from "use-immer";
import { Link } from "react-router-dom";
import io from "socket.io-client";
export default function Chat() {
  const socket = useRef(null);
  const chatField = useRef(null);
  const chatLog = useRef(null);
  const [state, setState] = useImmer({
    fieldValue: "",
    chatMesseges: []
  });

  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  useEffect(() => {
    if (appState.isChatOpen) {
      chatField.current.focus();
      appDispatch({ type: "clearUnreadChatCount" });
    }
  }, [appState.isChatOpen]);

  useEffect(() => {
    socket.current = io("http://localhost:5000");
    socket.current.on("chatFromServer", message => {
      setState(draft => {
        draft.chatMesseges.push(message);
      });
    });
    return () => socket.current.disconnect();
  }, []);

  useEffect(() => {
    chatLog.current.scrollTop = chatLog.current.scrollHeight;
    if (state.chatMesseges.length && !appState.isChatOpen) {
      appDispatch({ type: "incrementUnreadChatCount" });
    }
  }, [state.chatMesseges]);

  const handleFieldChange = e => {
    const value = e.target.value;
    setState(draft => {
      draft.fieldValue = value;
    });
  };
  const handleSubmit = e => {
    e.preventDefault();
    socket.current.emit("chatFromBrowser", {
      message: state.fieldValue,
      token: appState.user.token
    });
    setState(draft => {
      draft.chatMesseges.push({ message: draft.fieldValue, username: appState.user.username, avatar: appState.user.avatar });
      draft.fieldValue = "";
    });
  };
  return (
    <div id="chat-wrapper" className={"chat-wrapper shadow border-top border-left border-right " + (appState.isChatOpen ? "chat-wrapper--is-visible" : " ")}>
      <div className="chat-title-bar bg-primary">
        Chat
        <span className="chat-title-bar-close" onClick={() => appDispatch({ type: "closeChat" })}>
          <i className="fas fa-times-circle"></i>
        </span>
      </div>

      <div id="chat" className="chat-log" ref={chatLog}>
        {state.chatMesseges.map((message, index) => {
          if (message.username == appState.user.username) {
            return (
              <div className="chat-self" key={index}>
                <div className="chat-message">
                  <div className="chat-message-inner">{message.message}</div>
                </div>
                <img className="chat-avatar avatar-tiny" src={message.avatar} />
              </div>
            );
          }
          return (
            <div className="chat-other" key={index}>
              <Link to={`/profile/${message.username}`}>
                <img className="avatar-tiny" src={message.avatar} />
              </Link>
              <div className="chat-message">
                <div className="chat-message-inner">
                  <Link to={`/profile/${message.username}`}>
                    <strong>{message.username}: </strong>
                  </Link>
                  {message.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSubmit} id="chatForm" className="chat-form border-top">
        <input value={state.fieldValue} ref={chatField} onChange={handleFieldChange} type="text" className="chat-field" id="chatField" placeHolder="Type a message…" autoComplete="off" />
      </form>
    </div>
  );
}