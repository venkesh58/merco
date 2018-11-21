using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mercoproject.Models
{
    [Serializable] 
    public class ChatMessage
    {
        public Guid Id { get; set; }
        public string Username { get; set; }
        public Guid Context { get; set; }
        public string Location { get; set; }

        public string Message { get; set; }
        public DateTime Created { get; set; }

    }
}