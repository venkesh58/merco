using System;

namespace Mercoproject.Models
{
    public class Presence : IPresence
    {
        public Guid Id { get; set; }
		public Guid Context { get; set; }
        public bool Online { get; set; }
        public string UserName { get; set; }
		public Guid GroupId { get; set; }
		public string  streamId { get; set;}
        public Availability Availability { get; set; }
    }
}