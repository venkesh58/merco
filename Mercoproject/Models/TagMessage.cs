using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mercoproject.Models
{
	[Serializable] 
	public class TagMessage
	{
		public Guid GroupId { get; set; }
		public string Message { get; set; }
		public string Created { get; set; }
	}
}