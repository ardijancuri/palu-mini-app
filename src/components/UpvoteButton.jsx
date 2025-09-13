const UpvoteButton = ({ address, count, isUpvoted, onUpvote, isMobile = false, isLoading = false, disabled = false }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading && !disabled) {
      onUpvote();
    }
  };

  return (
    <div 
      className={`upvote-container ${isUpvoted ? 'upvoted' : ''} ${isLoading ? 'loading' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
    >
      <span className="upvote-count">{count}</span>
      {isLoading ? (
        <i className="fas fa-heart upvote-icon loading-heart"></i>
      ) : (
        <i className={`${isUpvoted ? 'fas' : 'far'} fa-heart upvote-icon`}></i>
      )}
    </div>
  );
};

export default UpvoteButton;
