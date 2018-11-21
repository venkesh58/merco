using System;
using Mercoproject.DataSync;

namespace Mercoproject.Models
{
	[Serializable]
	public class FakePeerModel
	{
		public Guid Id { get; set; }
		public Guid Context { get; set; }

		public string UserName { get; set; }

		public string GroupName { get; set; }
	}
}