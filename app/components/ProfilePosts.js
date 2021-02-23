import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useParams, Link } from "react-router-dom";
import LoadingDotsicon from "./LoadingDotsicon";
import Post from "./Post";
export default function ProfilePosts() {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const request = Axios.CancelToken.source();
    const getPosts = async function () {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, {
          cancelToken: request.token
        });
        setPosts(response.data);
        setIsLoading(false);
      } catch (error) {
        console.log("error from getpost");
      }
    };
    getPosts();
    return () => {
      request.cancel();
    };
  }, [username]);
  if (isLoading) return <LoadingDotsicon />;
  return (
    <div className="list-group">
      {posts.map(post => {
        return <Post noAuthor={true} post={post} key={post.id} />;
      })}
    </div>
  );
}
