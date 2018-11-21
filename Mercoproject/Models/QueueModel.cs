using System;
using Mercoproject.DataSync;

namespace Mercoproject
{
	/// <summary>
	/// Our basic datasync object that implements IDataSync
	/// </summary>
	public class QueueModel : IDataSyncObject
	{
		public Guid Id { get; set; }
		public string Name { get; set; }
		public string Question { get; set; }
		public string BackgroundColor { get; set; }
	}
}

