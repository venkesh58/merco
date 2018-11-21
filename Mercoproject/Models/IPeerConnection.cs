using System;

namespace Mercoproject.Models
{
    public interface IPeerConnection
    {
        Guid Context { get; set; }
        Guid PeerId { get; set; }
		Guid GroupId { get; set; }
    }
}