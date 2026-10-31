import { Badge, Group } from "@mantine/core";

interface Props {
  skills: string[];
  max?: number;
  color?: string;
}

// Shows a list of skills as small outlined tags
export default function SkillChips({ skills, max, color = "gray" }: Props) {
  const visible = max ? skills.slice(0, max) : skills;
  const hidden = max ? skills.length - visible.length : 0;

  return (
    <Group gap={6}>
      {visible.map(function (skill) {
        return (
          <Badge key={skill} variant="outline" color={color} fw={500}>
            {skill}
          </Badge>
        );
      })}
      {hidden > 0 && (
        <Badge variant="transparent" color="gray" fw={500}>
          +{hidden} more
        </Badge>
      )}
    </Group>
  );
}
