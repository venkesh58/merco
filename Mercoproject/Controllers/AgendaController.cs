using System;
using Mercoproject.DataSync;
using XSockets.Plugin.Framework.Attributes;

namespace Mercoproject.Controllers
{
	[XSocketMetadata("Agenda")]
	public class AgendaController : XSocketsDataSyncController<AgendaController, AgendaModel>
	{
	}
}
