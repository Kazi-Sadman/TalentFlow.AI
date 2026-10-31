import { Group, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import { MINT } from "../../theme";

interface Props {
  to?: string;
}

// The logo mark is three bars that get shorter: a hiring pipeline
export default function Logo({ to = "/" }: Props) {
  return (
    <Link to={to} style={{ textDecoration: "none", display: "inline-block" }} aria-label="TalentFlow AI home">
      <Group gap={10} wrap="nowrap">
        <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
          <rect width="32" height="32" rx="9" fill="#18211D" stroke="#2B3631" />
          <rect x="7" y="8" width="18" height="4" rx="2" fill={MINT} />
          <rect x="7" y="14" width="12" height="4" rx="2" fill={MINT} opacity="0.75" />
          <rect x="7" y="20" width="6" height="4" rx="2" fill={MINT} opacity="0.5" />
        </svg>
        <Text ff="heading" fw={700} size="lg" c="white" lh={1}>
          TalentFlow{" "}
          <Text span inherit c="brand.5">
            AI
          </Text>
        </Text>
      </Group>
    </Link>
  );
}
