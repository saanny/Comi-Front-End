import React, { useEffect, Suspense } from "react";
import ReactDOM from "react-dom";
import { useImmerReducer } from "use-immer";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Axios from "axios";
Axios.defaults.baseURL = process.env.BACKENDURL || "";

// Components
import LoadingDotsicon from "./components/LoadingDotsicon";
import Header from "./components/Header";
import HomeGuest from "./components/HomeGuest";
import Home from "./components/Home";
import Footer from "./components/Footer";
import About from "./components/About";
import Terms from "./components/Terms";
const CreatePost = React.lazy(() => import("./components/CreatePost"));
const ViewSinglePost = React.lazy(() => import("./components/ViewSinglePost"));
import FlashMessages from "./components/FlashMessages";
import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";
import Profile from "./components/Profile";
import EditPost from "./components/EditPost";
import NotFound from "./components/NotFound";
const Search = React.lazy(() => import("./components/Search"));
import { CSSTransition } from "react-transition-group";
const Chat = React.lazy(() => import("./components/Chat"));
function Main() {
  const initState = {
    loggedIn: Boolean(localStorage.getItem("complexAppToken")),
    flashMesseges: [],
    isSearchOpen: false,
    isChatOpen: false,
    user: {
      token: localStorage.getItem("complexAppToken"),
      username: localStorage.getItem("complexUserName"),
      avatar: localStorage.getItem("complexAvatar")
    },
    unreadChatCount: 0
  };
  function appReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true;
        draft.user = action.data;
        break;
      case "logout":
        draft.loggedIn = false;
        break;
      case "flashMesseges":
        draft.flashMesseges.push(action.value);
        break;
      case "openSearch":
        draft.isSearchOpen = true;
        break;
      case "closeSearch":
        draft.isSearchOpen = false;
        break;
      case "toggleChat":
        draft.isChatOpen = !draft.isChatOpen;
        break;
      case "closeChat":
        draft.isChatOpen = false;
        break;
      case "incrementUnreadChatCount":
        draft.unreadChatCount++;
        break;
      case "clearUnreadChatCount":
        draft.unreadChatCount = 0;
        break;
    }
  }
  const [state, dispatch] = useImmerReducer(appReducer, initState);

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("complexAppToken", state.user.token);
      localStorage.setItem("complexUserName", state.user.username);
      localStorage.setItem("complexAvatar", state.user.avatar);
    } else {
      localStorage.removeItem("complexAppToken");
      localStorage.removeItem("complexUserName");
      localStorage.removeItem("complexAvatar");
    }
  }, [state.loggedIn]);
  // check if token expire or not
  useEffect(() => {
    const request = Axios.CancelToken.source();
    if (state.loggedIn) {
      const fetchResults = async () => {
        try {
          const response = await Axios.post(
            "/checkToken",
            {
              token: state.user.token
            },
            {
              token: request.token
            }
          );
          if (!response.data) {
            dispatch({ type: "logout" });
            dispatch({ type: "flashMesseges", value: "Your session has expired plase log in again" });
          }
        } catch (error) {
          console.log("there was problem  or the request was cancelled");
        }
      };
      fetchResults();
      return () => request.cancel;
    }
  }, []);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messeges={state.flashMesseges} />
          <Header />
          <Suspense fallback={<LoadingDotsicon />}>
            <Switch>
              <Route path="/profile/:username">
                <Profile />
              </Route>
              <Route path="/post/:id/edit" exact>
                <EditPost />
              </Route>
              <Route path="/" exact>
                {state.loggedIn ? <Home /> : <HomeGuest />}
              </Route>
              <Route path="/create-post">
                <CreatePost />
              </Route>
              <Route path="/post/:id">
                <ViewSinglePost />
              </Route>
              <Route path="/about-us">
                <About />
              </Route>
              <Route path="/terms">
                <Terms />
              </Route>
              <Route>
                <NotFound />
              </Route>
            </Switch>
          </Suspense>

          <CSSTransition timeout={330} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
            <div className="search-overlay">
              <Suspense fallback="">
                <Search />
              </Suspense>
            </div>
          </CSSTransition>
          <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

ReactDOM.render(<Main />, document.querySelector("#app"));

if (module.hot) {
  module.hot.accept();
}
