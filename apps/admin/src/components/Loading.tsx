import { CircularProgress } from "@mui/material";

export default function Loading() {
  return (
    <div className="loading">
        <CircularProgress />
      {/* <img src={Images.LOADING} alt="Loading" /> */}
    </div>
  );
}
