function PopupMessage({ message }) {
  if (!message) return null;

  return (
    <div className="popup-message">
      {message}
    </div>
  );
}

export default PopupMessage;