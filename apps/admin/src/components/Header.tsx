import { Avatar, Button, Menu, MenuItem } from "@mui/material";
import React from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../helpers/constants";
import { useRestMutation } from "@ethos-frontend/hook";
import { API_URL } from "@ethos-frontend/constants";

export default function Header() {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const userDetails = {} as any;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (action: string) => {
    if (action === "logout") {
      logoutMutation.mutate(undefined, {
        onSettled: () => {
          localStorage.clear();
          navigate(ROUTES.LOGIN);
        },
      });
    }

    setAnchorEl(null);
  };

  const navigate = useNavigate();
  const logoutMutation = useRestMutation(API_URL.logout, { method: "POST" });
  return (
    <header className="flex items-center justify-end bg-white px-4 py-2 border-b">
      <div className="flex items-center">
        <Button
          id="basic-button"
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
        >
          <div className="flex items-center gap-2">
            <Avatar
              alt="User name"
              src={
                userDetails?.profilePicture
                  ? userDetails.profilePicture
                  : userData?.profilePicture
                    ? userData.profilePicture
                    : null
              }
            />
            <div className="hidden sm:block text-left">
              <h4 className="text-sm font-medium">{userData?.type}</h4>
              <p className="text-xs">
                {userDetails?.email ? userDetails.email : userData.email}
              </p>
            </div>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </div>
        </Button>
        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={() => handleClose("logout")}>Logout</MenuItem>
        </Menu>
      </div>
    </header>
  );
}
