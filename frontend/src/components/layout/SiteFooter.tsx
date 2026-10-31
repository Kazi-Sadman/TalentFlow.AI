import { Box, Container, SimpleGrid, Stack, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import { LINE } from "../../theme";
import Logo from "./Logo";

interface FooterColumnProps {
  title: string;
  links: { to: string; label: string }[];
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <Stack gap="xs">
      <Text size="sm" fw={700} c="white">
        {title}
      </Text>
      {links.map(function (link) {
        return (
          <Link key={link.to + link.label} to={link.to} className="footer-link">
            {link.label}
          </Link>
        );
      })}
    </Stack>
  );
}

export default function SiteFooter() {
  return (
    <Box component="footer" mt={96} pt={56} pb="xl" style={{ borderTop: "1px solid " + LINE }}>
      <Container size="lg">
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing={40}>
          <Stack gap="md" style={{ gridColumn: "span 2" }} maw={360}>
            <Logo />
            <Text size="sm" c="dimmed">
              Recruitment software that shows the evidence behind every skill match. The recruiter always makes the final decision.
            </Text>
          </Stack>

          <FooterColumn
            title="Product"
            links={[
              { to: "/features", label: "Features" },
              { to: "/pricing", label: "Pricing" },
              { to: "/jobs", label: "Browse jobs" }
            ]}
          />
          <FooterColumn
            title="Company"
            links={[
              { to: "/about", label: "About us" },
              { to: "/contact", label: "Contact" },
              { to: "/login", label: "Sign in" },
              { to: "/register", label: "Create account" }
            ]}
          />
        </SimpleGrid>

        <Text size="xs" c="dimmed" mt={48}>
          TalentFlow AI. Skill matches are suggestions and never replace a human decision.
        </Text>
      </Container>
    </Box>
  );
}
