import React, { useContext, useEffect } from "react";
import DispatchContext from "../DispatchContext";
import { useImmer } from "use-immer";
import Axios from "axios";
import Post from "./Post";
export default function Search() {
  const dispatch = useContext(DispatchContext);
  const [state, setState] = useImmer({
    searchTerm: "",
    results: [],
    show: "neither",
    requestCount: 0
  });

  useEffect(() => {
    document.addEventListener("keyup", searchKeyPressHandler);
    return () => document.removeEventListener("keyup", searchKeyPressHandler);
  }, []);

  useEffect(() => {
    if (state.searchTerm.trim()) {
      setState(draft => {
        draft.show = "loading";
      });
      const delay = setTimeout(() => {
        setState(draft => {
          draft.requestCount++;
        });
      }, 700);
      return () => clearTimeout(delay);
    } else {
      setState(draft => {
        draft.show = "neither";
      });
    }
  }, [state.searchTerm]);

  useEffect(() => {
    const request = Axios.CancelToken.source();
    if (state.requestCount) {
      const fetchResults = async () => {
        try {
          const response = await Axios.post(
            "/search",
            {
              searchTerm: state.searchTerm
            },
            {
              token: request.token
            }
          );
          setState(draft => {
            draft.results = response.data;
            draft.show = "results";
          });
        } catch (error) {
          console.log("there was problem  or the request was cancelled");
        }
      };
      fetchResults();
      return () => request.cancel;
    }
  }, [state.requestCount]);

  const searchKeyPressHandler = e => {
    if (e.keyCode == 27) {
      dispatch({ type: "closeSearch" });
    }
  };
  const handleInput = e => {
    const value = e.target.value;
    setState(draft => {
      draft.searchTerm = value;
    });
  };
  return (
    <>
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input onChange={handleInput} autoFocus type="text" autoComplete="off" id="live-search-field" className="live-search-field" placeholder="What are you interested in?" />
          <span className="close-live-search" onClick={() => dispatch({ type: "closeSearch" })}>
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div className={"circle-loader " + (state.show == "loading" ? "circle-loader--visible" : " ")}></div>
          <div className={"live-search-results " + (state.show == "results" ? "live-search-results--visible" : "")}>
            {Boolean(state.results.length) && (
              <div className="list-group shadow-sm">
                <div className="list-group-item active">
                  <strong>Search Results</strong> ({state.results.length} {state.results.length > 1 ? "items" : "item"} found)
                </div>
                {state.results.map(post => {
                  return (
                    <Post
                      post={post}
                      key={post.id}
                      onClick={() => {
                        appDispatch({ type: "closeSearch" });
                      }}
                    />
                  );
                })}
              </div>
            )}
            {!Boolean(state.results.length) && <p className="alert alert-danger text-center shadow-sm"> sorry, we could not found </p>}
          </div>
        </div>
      </div>
    </>
  );
}
