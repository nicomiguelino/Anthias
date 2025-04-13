export const Alert = ({ message }) => {
  return (
    <div id="request-error" className="navbar navbar fixed-top">
      <div className="container">
        <div className="alert">
          <button className="close" type="button">
            &times;
          </button>
          <span className="msg">{message}</span>
        </div>
      </div>
    </div>
  )
}
