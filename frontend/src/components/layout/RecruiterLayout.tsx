import { AppShell, Avatar, Box, Burger, Button, Divider, Group, Menu, Stack, Text, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBriefcase, IconExternalLink, IconLayoutDashboard, IconLogout, IconPlus } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BG, LINE, NAVY, NAVY_RAISED } from "../../theme";
import Logo from "./Logo";

interface SideLinkProps {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
  onClick: () => void;
}

// One link in the dark sidebar
function SideLink({ to, label, icon, end, onClick }: SideLinkProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      style={function ({ isActive }) {
        return {
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 12px",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
          color: isActive ? "#47DC9A" : "#C3CFC9",
          background: isActive ? NAVY_RAISED : "transparent"
        };
      }}
    >
      {icon}
      {label}
    </NavLink>
  );
}

// The recruiter area: top bar + dark sidebar + page
export default function RecruiterLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [opened, { toggle, close }] = useDisclosure(false);

  useEffect(
    function () {
      window.scrollTo(0, 0);
    },
    [location.pathname]
  );

  function handleLogout() {
    logout();
    navigate("/");
  }

  const name = user ? user.fullName : "";
  const email = user ? user.email : "";

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="lg"
      styles={{ main: { background: BG } }}
    >
      <AppShell.Header style={{ borderBottom: "1px solid " + LINE, background: NAVY }}>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" aria-label="Open menu" />
            <Logo to="/recruiter" />
          </Group>

          <Menu position="bottom-end" width={230} shadow="md">
            <Menu.Target>
              <UnstyledButton aria-label="Account menu">
                <Group gap="xs" wrap="nowrap">
                  <Box visibleFrom="sm" ta="right">
                    <Text size="sm" fw={600} lh={1.2}>
                      {name}
                    </Text>
                    <Text size="xs" c="dimmed" lh={1.2}>
                      Recruiter
                    </Text>
                  </Box>
                  <Avatar color="brand" radius="xl">
                    {name.charAt(0).toUpperCase()}
                  </Avatar>
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Box px="sm" py={6}>
                <Text size="xs" c="dimmed" className="break-anywhere">
                  {email}
                </Text>
              </Box>
              <Menu.Divider />
              <Menu.Item component={Link} to="/" leftSection={<IconExternalLink size={16} />}>
                View public site
              </Menu.Item>
              <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={handleLogout}>
                Sign out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" style={{ background: NAVY, borderRight: "1px solid " + LINE }}>
        <Stack gap="lg" h="100%">
          <Button component={Link} to="/recruiter/jobs/new" leftSection={<IconPlus size={18} />} fullWidth onClick={close}>
            Post a job
          </Button>

          <Stack gap={4}>
            <SideLink to="/recruiter" end label="Overview" icon={<IconLayoutDashboard size={18} />} onClick={close} />
            <SideLink to="/recruiter/jobs" label="Jobs and applicants" icon={<IconBriefcase size={18} />} onClick={close} />
          </Stack>

          <Box mt="auto">
            <Divider color={NAVY_RAISED} mb="md" />
            <Text size="xs" c="dimmed">
              Signed in as
            </Text>
            <Text size="sm" c="white" fw={600} className="break-anywhere">
              {name}
            </Text>
          </Box>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Box maw={1120} mx="auto">
          <Outlet />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
