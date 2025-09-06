import React from 'react';

interface PostCardProps {
  title: string;
  author: string;
  time: string;
  category: string;
  onClick?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ title, author, time, category, onClick }) => (
  <div onClick={onClick} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 12, cursor: 'pointer' }}>
    <h3>{title}</h3>
    <div style={{ fontSize: 12, color: '#888' }}>By {author} | {time} | {category}</div>
  </div>
);

export default PostCard;
