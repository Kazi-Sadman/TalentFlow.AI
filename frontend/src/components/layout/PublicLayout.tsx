import { Box } from "@mantine/core";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

// Header + page + footer for the public pages
export default function PublicLayout() {
  const location = useLocation();

  // Start at the top of the page when the user opens another page
  useEffect(
    function () {
      window.scrollTo(0, 0);
    },
    [location.pathname]
  );

  return (
    <Box mih="100vh" style={{ display: "flex", flexDirection: "column" }}>
      <SiteHeader />
      <Box component="main" style={{ flex: 1 }}>
        <Outlet />
      </Box>
      <SiteFooter />
    </Box>
  );
}
