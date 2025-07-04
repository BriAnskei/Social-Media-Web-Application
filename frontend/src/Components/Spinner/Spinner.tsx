const Spinner = () => {
  return (
    <div className="d-flex justify-content-center">
      <div className="spinner-grow" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Spinner;

export const MessageSpinner = () => {
  return (
    <div className="spinner-border text-dark" role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
};
