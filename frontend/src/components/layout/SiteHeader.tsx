import { ActionIcon, Avatar, Box, Button, Group, Menu, Text, UnstyledButton } from "@mantine/core";
import { IconLayoutDashboard, IconLogout, IconMenu2 } from "@tabler/icons-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { GLASS } from "../../theme";
import { homePathFor } from "../../utils/format";
import Logo from "./Logo";
import { NAV_ITEMS } from "./navLinks";

function initials(fullName: string): string {
  const parts = fullName.split(" ").filter(function (part) {
    return part.length > 0;
  });
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// A floating glass bar at the top of the public pages and the candidate pages
export default function SiteHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <Box component="header" style={{ position: "sticky", top: 0, zIndex: 100, padding: "12px 12px 0" }}>
      <Box
        maw={1180}
        mx="auto"
        px="md"
        h={60}
        style={{
          ...GLASS,
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16
        }}
      >
        <Logo />

        <Box component="nav" visibleFrom="md" aria-label="Main menu">
          <Group gap={2}>
            {NAV_ITEMS.map(function (item) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={function ({ isActive }) {
                    return isActive ? "nav-link active" : "nav-link";
                  }}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </Group>
        </Box>

        <Group gap="xs" wrap="nowrap">
          {user === null ? (
            <>
              <Button component={Link} to="/register" visibleFrom="sm">
                Get Started
              </Button>
              <Button component={Link} to="/login" variant="default" visibleFrom="sm">
                Sign In
              </Button>
            </>
          ) : (
            <>
              <Button
                component={Link}
                to={homePathFor(user.role)}
                variant="light"
                visibleFrom="sm"
                leftSection={<IconLayoutDashboard size={18} />}
              >
                {user.role === "Recruiter" ? "Dashboard" : "My applications"}
              </Button>
              <Menu position="bottom-end" width={230} shadow="md">
                <Menu.Target>
                  <UnstyledButton aria-label="Account menu" visibleFrom="sm">
                    <Avatar color="brand" radius="xl">
                      {initials(user.fullName)}
                    </Avatar>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Box px="sm" py={6}>
                    <Text fw={600} size="sm">
                      {user.fullName}
                    </Text>
                    <Text size="xs" c="dimmed" className="break-anywhere">
                      {user.email}
                    </Text>
                  </Box>
                  <Menu.Divider />
                  <Menu.Item component={Link} to={homePathFor(user.role)} leftSection={<IconLayoutDashboard size={16} />}>
                    {user.role === "Recruiter" ? "Dashboard" : "My applications"}
                  </Menu.Item>
                  <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={handleLogout}>
                    Sign out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </>
          )}

          {/* Menu for small screens */}
          <Menu position="bottom-end" width={230} shadow="md">
            <Menu.Target>
              <ActionIcon variant="default" size={38} hiddenFrom="md" aria-label="Open menu">
                <IconMenu2 size={20} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {NAV_ITEMS.map(function (item) {
                return (
                  <Menu.Item key={item.to} component={Link} to={item.to}>
                    {item.label}
                  </Menu.Item>
                );
              })}
              <Menu.Divider />
              {user === null ? (
                <>
                  <Menu.Item component={Link} to="/register" c="brand.5" fw={600}>
                    Get Started
                  </Menu.Item>
                  <Menu.Item component={Link} to="/login">
                    Sign In
                  </Menu.Item>
                </>
              ) : (
                <>
                  <Menu.Item component={Link} to={homePathFor(user.role)}>
                    {user.role === "Recruiter" ? "Dashboard" : "My applications"}
                  </Menu.Item>
                  <Menu.Item color="red" onClick={handleLogout}>
                    Sign out
                  </Menu.Item>
                </>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Box>
    </Box>
  );
}
