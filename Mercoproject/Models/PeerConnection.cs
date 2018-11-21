using System;

namespace Mercoproject.Models
{    
    public class PeerConnection : IPeerConnection
    {
        public Guid Context { get; set; }
        public Guid PeerId { get; set; }
		public Guid GroupId { get; set; }
    }
}