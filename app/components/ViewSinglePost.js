import React, { useState, useEffect, useContext } from "react";
import Page from "./Page";
import Axios from "axios";
import { useParams, Link, withRouter } from "react-router-dom";
import LoadingDotsicon from "./LoadingDotsicon";
import ReactMarkDown from "react-markdown";
import ReactTooltip from "react-tooltip";
import NotFound from "./NotFound";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

function ViewSinglePost(props) {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState();
  useEffect(() => {
    const request = Axios.CancelToken.source();
    const getPost = async function () {
      try {
        const response = await Axios.get(`/post/${id}`, {
          cancelToken: request.token
        });
        setPost(response.data);
        setIsLoading(false);
      } catch (error) {
        console.log("error from post page review");
      }
    };
    getPost();
    return () => {
      request.cancel();
    };
  }, [id]);
  if (!isLoading && !post) {
    return <NotFound />;
  }
  if (isLoading)
    return (
      <Page title="...">
        <LoadingDotsicon />
      </Page>
    );
  const date = new Date(post.createdDate);
  const dateFormated = `${date.getMonth() + 1}/${date.getDay()}/${date.getFullYear()}`;

  const isOwner = () => {
    if (appState.loggedIn) {
      return appState.user.username == post.author.username;
    }
    return false;
  };
  const deleteHandler = async () => {
    const areYouSure = window.confirm("do you really want to delete this post");
    if (areYouSure) {
      try {
        const response = await Axios.delete(`/post/${id}`, {
          data: {
            token: appState.user.token
          }
        });
        if (response.data == "Success") {
          appDispatch({ type: "flashMesseges", value: "Post Was Successfully Deleted" });
          props.history.push(`/profile/${appState.user.username}`);
        }
      } catch (error) {
        console.log("there was a problem");
      }
    }
  };

  return (
    <Page title={post.title}>
      <div class="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {isOwner() && (
          <span class="pt-2">
            <Link to={`/post/${post._id}/edit`} data-tip="Edit" data-for="edit" class="text-primary mr-2">
              <i class="fas fa-edit"></i>
            </Link>
            <ReactTooltip id="edit" className="custom-tooltip" />{" "}
            <a data-tip="Delete" data-for="delete" class="delete-post-button text-danger" onClick={deleteHandler}>
              <i class="fas fa-trash"></i>
            </a>
            <ReactTooltip id="delete" className="custom-tooltip" />
          </span>
        )}
      </div>

      <p class="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img class="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {dateFormated}
      </p>

      <div class="body-content">
        <ReactMarkDown source={post.body} />
      </div>
    </Page>
  );
}
export default withRouter(ViewSinglePost);
