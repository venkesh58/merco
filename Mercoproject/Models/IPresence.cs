using System;

namespace Mercoproject.Models
{
    public interface IPresence
    {
        Guid Id { get; set; }
		Guid Context { get; set; }
        bool Online { get; set; }
        string UserName { get; set; }
		Guid GroupId { get; set; }
		string streamId { get; set;}
        Availability Availability { get; set; }        
    }
}