using System;
using System.Threading.Tasks;
using XSockets.Core.XSocket;
using XSockets.Core.XSocket.Helpers;
using XSockets.Plugin.Framework.Attributes;
using XSockets.Core.Common.Socket.Event.Interface;
using System.Collections.Generic;
using System.Linq;

namespace Mercoproject.Controllers
{
	[XSocketMetadata("simple")]
	public class SimpleController : XSocketController
    {
		public Guid context { get; set; }
		public override async Task OnOpened()
		{
			if (this.HasParameterKey("ctx"))
			{
				this.context = new Guid(this.GetParameter("ctx"));
			}
			await base.OnOpened();
		}
			

    }


}
