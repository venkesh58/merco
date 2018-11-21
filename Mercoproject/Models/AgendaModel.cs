using System;
using Mercoproject.DataSync;

namespace Mercoproject
{
	/// <summary>
	/// Our basic datasync object that implements IDataSync
	/// </summary>
	public class AgendaModel : IDataSyncObject
	{
		public Guid Id { get; set; }
		public string[] Topics { get; set; }
		public string Highlight { get; set;}
	}
}

