using System;
using Mercoproject.DataSync;
using XSockets.Plugin.Framework.Attributes;

namespace Mercoproject.Controllers
{
	[XSocketMetadata("Queue")]
	public class QueueController : XSocketsDataSyncController<QueueController, QueueModel>
	{
	}
}
