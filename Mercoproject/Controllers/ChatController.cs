using XSockets.Core.XSocket;
using XSockets.Core.XSocket.Helpers;
using XSockets.Core.Common.Socket.Event.Interface;
using System.Threading.Tasks;
using System;
using OrigoDB.Core;
using Mercoproject.PM;
using Mercoproject.Models;
using XSockets.Core.Common.Socket.Attributes;

namespace MercoSample.Controllers
{
	public class ChatController : XSocketController
	{
		
		private static PersistenceModel _persistenceModel;
		[PersistentProperty]
		public FakePeerModel Peer { get; set; }

		public async Task SetUserName(string username)
		{
			this.Peer.UserName = username;
			await this.Invoke(this.Peer, "usernameChange");
		}

		// use fake peer model as the user model......
		public async Task SetUserNameAndGroupName(FakePeerModel peermodel)
		{
			this.Peer.UserName = peermodel.UserName;
			this.Peer.GroupName = peermodel.GroupName;

			if (peermodel.Id != Guid.Empty) {				
				this.Peer.Id = peermodel.Id;
			}
			_persistenceModel.UpdatePeerModel (this.Peer);

			await this.Invoke(this.Peer, "usernamegroupnameChange");
		}

		public async Task GetUserName()
		{
			await this.Invoke(this.Peer, "userInfo");
		}

		public override Task OnOpened()
		{
			if (this.HasParameterKey("ctx")){
				this.Context = Guid.Parse(this.GetParameter("ctx"));
			}
			else
				this.Context = Guid.NewGuid();
			
			// If there is no FakePeer, create a new one...
			if(this.Peer == null)
			{
				this.Peer = new FakePeerModel();
				this.Peer.Id = Guid.NewGuid();
				this.Peer.UserName = "Default User";
				this.Peer.Context = this.Context;
				this.Peer.GroupName = "Global";

				_persistenceModel.AddPeerModel (Peer);
			}
			
			this.Invoke(new { Id = this.Id, Context = this.Context, UserName = this.UserName, GroupName = this.GroupName }, "onContext");

			return base.OnOpened();
		}

		public async Task ChangeContext(Guid context)
		{
			this.Context = context;
			await this.Invoke(new { Context = this.Context }, "onContextChange");
		}

		/// <summary>
		/// Change user name
		/// </summary>
		/// <param name="username"></param>
		/// <returns></returns>
		public async Task ChangeUserName(string username)
		{
			this.UserName = username;
			await this.Invoke(new { Context = this.Context, UserName = this.UserName }, "onContextChange");
		}

		/// <summary>
		///    [PersistentProperty] Keeps the previos values in memory
		/// </summary>

		[PersistentProperty]
		public Guid Id { get; set; }

		[PersistentProperty]
		public Guid Context { get; set; }

		[PersistentProperty]
		public String UserName { get; set; }

		[PersistentProperty]
		public String GroupName { get; set; }

		static ChatController()
		{
			_persistenceModel = Db.For<PersistenceModel>(); // get an "database"
		}
		public async Task ChatMessage(ChatMessage chatMessage)
		{
			chatMessage.Id = Guid.NewGuid();
			//chatMessage.Username = chatMessage.UserName;
			chatMessage.Created = DateTime.Now;
			chatMessage.Context = this.Context;

			_persistenceModel.AddChatMessage(chatMessage); // save

			// send it to all "client" that have the "same" context as the callee
			await this.InvokeTo(p => p.Context == this.Context, chatMessage, "chatMessage");
		}


		// Get all "chatmessages"
		public async Task ChatMessages()
		{
			var messages = _persistenceModel.GetChatMessages(this.Context);
			await this.Invoke(messages, "chatMessages"); // send the to callee
		}

		// Get all "user models"
		public async Task PeerModels()
		{
			var messages = _persistenceModel.GetPeerModels(this.Context);
			await this.Invoke(messages, "peerModels"); // send the to callee
		}

	}


}