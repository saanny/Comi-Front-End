import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useParams, Link } from "react-router-dom";
import LoadingDotsicon from "./LoadingDotsicon";

export default function ProfileFollowers() {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [followers, setFollowers] = useState([]);
  useEffect(() => {
    const request = Axios.CancelToken.source();
    const getFollowers = async function () {
      try {
        const response = await Axios.get(`/profile/${username}/followers`, {
          cancelToken: request.token
        });
        setFollowers(response.data);
        setIsLoading(false);
      } catch (error) {
        console.log("error from getpost");
      }
    };
    getFollowers();
    return () => {
      request.cancel();
    };
  }, [username, followers]);
  if (isLoading) return <LoadingDotsicon />;
  return (
    <div className="list-group">
      {followers.map((follower, index) => {
        return (
          <Link to={`/profile/${follower.username}`} className="list-group-item list-group-item-action" key={index}>
            <img className="avatar-tiny" src={follower.avatar} />
            {follower.username}
          </Link>
        );
      })}
    </div>
  );
}
