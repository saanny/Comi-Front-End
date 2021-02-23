import React, { useContext, useEffect } from "react";
import Page from "./Page";
import StateContext from "../StateContext";
import { useImmer } from "use-immer";
import Axios from "axios";
import LoadingDotsicon from "./LoadingDotsicon";
import Post from "./Post";
export default function Home() {
  const appState = useContext(StateContext);
  const [state, setState] = useImmer({ isLoading: true, feed: [] });
  useEffect(() => {
    const request = Axios.CancelToken.source();
    async function fetchData() {
      try {
        const response = await Axios.post(
          "/getHomeFeed",
          {
            token: appState.user.token
          },
          {
            cancelToken: request.token
          }
        );
        setState(draft => {
          draft.isLoading = false;
          draft.feed = response.data;
        });
      } catch (error) {
        console.log("problem profile page");
      }
    }
    fetchData();
    return () => {
      request.cancel();
    };
  }, []);
  if (state.isLoading) return <LoadingDotsicon />;
  return (
    <Page title="Your Feed">
      {state.feed.length > 0 && (
        <>
          <h2 className="text-center mb-4">The lates from those you follow</h2>
          <div className="list-group">
            {state.feed.map(post => {
              return <Post post={post} key={post.id} />;
            })}
          </div>
        </>
      )}
      {state.feed.length == 0 && (
        <>
          <h2 className="text-center">
            Hello <strong>{appState.user.username}</strong>, your feed is empty.
          </h2>
          <p className="lead text-muted text-center">Your feed displays the latest posts from the people you follow. If you don&rsquo;t have any friends to follow that&rsquo;s okay; you can use the &ldquo;Search&rdquo; feature in the top menu bar to find content written by people with similar interests and then follow them.</p>
        </>
      )}
    </Page>
  );
}
