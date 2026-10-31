using System;
using System.Collections.Generic;

namespace TalentFlow.Api.Entities
{
    public class Company
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Website { get; set; }
        public DateTime CreatedAt { get; set; }

        public List<Job> Jobs { get; set; } = new List<Job>();
        public List<User> Users { get; set; } = new List<User>();
    }
}
