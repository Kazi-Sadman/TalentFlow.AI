import { Button, Container } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import EmptyState from "../../components/common/EmptyState";

export default function NotFoundPage() {
  return (
    <Container size="sm" py={80}>
      <EmptyState
        icon={<IconSearch size={24} />}
        title="This page does not exist"
        text="The link may be old or the address may have a typing mistake."
        action={
          <Button component={Link} to="/" mt="xs">
            Go to the home page
          </Button>
        }
      />
    </Container>
  );
}
