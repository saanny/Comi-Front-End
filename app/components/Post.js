import React from "react";
import { Link } from "react-router-dom";
export default function Post({ post, key, onClick, noAuthor }) {
  const date = new Date(post.createdDate);
  const dateFormated = `${date.getMonth() + 1}/${date.getDay()}/${date.getFullYear()}`;
  return (
    <Link onClick={onClick} to={`/post/${post._id}`} className="list-group-item list-group-item-action">
      <img className="avatar-tiny" src={post.author.avatar} /> <strong>{post.title}</strong>{" "}
      <span className="text-muted small">
        {!noAuthor && <>by {post.author.username}</>} on {dateFormated}{" "}
      </span>
    </Link>
  );
}
