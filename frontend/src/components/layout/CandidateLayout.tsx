import { Box, Container, Tabs } from "@mantine/core";
import { IconBriefcase, IconFileText, IconUser } from "@tabler/icons-react";
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { LINE, SURFACE } from "../../theme";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

// Header + tabs (applications, CVs, profile) for a logged-in candidate
export default function CandidateLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  let activeTab = "applications";
  if (location.pathname.indexOf("/candidate/resumes") === 0) {
    activeTab = "resumes";
  }
  if (location.pathname.indexOf("/candidate/profile") === 0) {
    activeTab = "profile";
  }

  useEffect(
    function () {
      window.scrollTo(0, 0);
    },
    [location.pathname]
  );

  function handleTabChange(value: string | null) {
    if (value) {
      navigate("/candidate/" + value);
    }
  }

  return (
    <Box mih="100vh" style={{ display: "flex", flexDirection: "column" }}>
      <SiteHeader />
      <Box mt={16} style={{ background: SURFACE, borderTop: "1px solid " + LINE, borderBottom: "1px solid " + LINE }}>
        <Container size="lg">
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tabs.List style={{ borderBottom: "none" }}>
              <Tabs.Tab value="applications" py="md" leftSection={<IconBriefcase size={17} />}>
                My applications
              </Tabs.Tab>
              <Tabs.Tab value="resumes" py="md" leftSection={<IconFileText size={17} />}>
                My CVs
              </Tabs.Tab>
              <Tabs.Tab value="profile" py="md" leftSection={<IconUser size={17} />}>
                Profile
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </Container>
      </Box>
      <Container size="lg" py="xl" style={{ flex: 1, width: "100%" }}>
        <Outlet />
      </Container>
      <SiteFooter />
    </Box>
  );
}
