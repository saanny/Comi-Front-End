import React, { useState, useEffect } from "react";
import Axios from "axios";
import { useParams, Link } from "react-router-dom";
import LoadingDotsicon from "./LoadingDotsicon";

export default function ProfileFollowing() {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [followings, setFollowings] = useState([]);
  useEffect(() => {
    const request = Axios.CancelToken.source();
    const getFollowing = async function () {
      try {
        const response = await Axios.get(`/profile/${username}/following`, {
          cancelToken: request.token
        });
        setFollowings(response.data);
        setIsLoading(false);
      } catch (error) {
        console.log("error from getpost");
      }
    };
    getFollowing();
    return () => {
      request.cancel();
    };
  }, [username, followings]);
  if (isLoading) return <LoadingDotsicon />;
  return (
    <div className="list-group">
      {followings.map((following, index) => {
        return (
          <Link to={`/profile/${following.username}`} className="list-group-item list-group-item-action" key={index}>
            <img className="avatar-tiny" src={following.avatar} />
            {following.username}
          </Link>
        );
      })}
    </div>
  );
}
