using System;

namespace TalentFlow.Api.Entities
{
    // Keeps a history of important changes (who changed what and when).
    public class AuditLog
    {
        public int Id { get; set; }

        public int ActorUserId { get; set; }
        public User ActorUser { get; set; }

        public string EntityType { get; set; }
        public int EntityId { get; set; }
        public string Action { get; set; }
        public DateTime CreatedAtUtc { get; set; }
    }
}
