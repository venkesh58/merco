﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Mercoproject.Constants;
using Mercoproject.Models;
using Mercoproject.PM;
using XSockets.Core.Common.Socket.Event.Attributes;
using XSockets.Core.Common.Socket.Event.Interface;
using XSockets.Core.Common.Utility.Logging;
using XSockets.Core.XSocket;
using XSockets.Core.XSocket.Helpers;
using XSockets.Plugin.Framework;
using XSockets.Core.Common.Socket.Attributes;
using OrigoDB.Core;

namespace Mercoproject.Controllers
{ 
    /// <summary>
    /// A custom Peerbroker for WebRTC signaling and WebSocket communication on top of XSockets.NET
    /// </summary>
    public class ConnectionBroker : XSocketController, IConnectionBroker
    {

		private static PersistenceTagRecordModel _persistenceTagRecordModel;
		/// <summary>
		///    [PersistentProperty] Keeps the previos values in memory
		/// </summary>
		[PersistentProperty]
		public Guid GroupId { get; set; }

		[PersistentProperty]
		public Guid ContextId { get; set; }


        #region Public Properties
	
        /// <summary>
        /// List of PeerConnections that the Peer has connected to
        /// </summary>
        [NoEvent]
        public List<IPeerConnection> Connections { get; set; }

        /// <summary>
        /// The Peer for this client
        /// </summary>
        [NoEvent]
        public IPeerConnection Peer { get; set; }

        [NoEvent]
        public IPresence Presence { get; set; }

        #endregion

        #region Ctor

        /// <summary>
        /// Ctor - setting up connectionlist and open/close events
        /// </summary>
        public ConnectionBroker()
        {
            Connections = new List<IPeerConnection>();
			_persistenceTagRecordModel = Db.For<PersistenceTagRecordModel>();
        }

        #endregion

        #region Overrides & Events
        /// <summary>
        /// When a client connects create a new PeerConnection and send the information the the client
        /// </summary>
        public override async Task OnOpened()
        {
			var groupId = Guid.NewGuid();
			if (this.HasParameterKey("grouppeer"))
			{
				var p = this.GetParameter("grouppeer");
				groupId = Guid.Parse(p);
				this.GroupId = groupId;
			}

			// Get the context from a parameter if it exists
			var context = Guid.NewGuid();

			if (this.HasParameterKey("ctx"))
			{
				var p = this.GetParameter("ctx");
				context = Guid.Parse(p);
				this.ContextId = context;
			}

			IPresence user = new Presence {Online = true, UserName = "Unknown", GroupId = groupId, Context = context, Id = this.PersistentId};
            //Update user
            if (XSockets.Core.Utility.Storage.Repository<Guid, IPresence>.ContainsKey(this.PersistentId))
            {
                user = XSockets.Core.Utility.Storage.Repository<Guid, IPresence>.GetById(user.Id);                
                if (this.HasParameterKey("username"))
                    user.UserName = this.GetParameter("username");                               
            }
            SavePresence(user);
            var others = XSockets.Core.Utility.Storage.Repository<Guid, IPresence>.Find(p => p.Id != user.Id);
            Composable.GetExport<IXLogger>().Information("Others {@a}",others);
            await this.Invoke(others,"allusers");

            Peer = new PeerConnection
            {
                Context = context,
                PeerId = ConnectionId,
				GroupId = groupId
            };

            await this.Invoke(Peer, Events.Context.Created);                        
        }

        public void GetContext()
        {
            this.Invoke(Peer, Events.Context.Created);
        }

        /// <summary>
        /// When a client disconnects tell the other clients about the Peer being lost
        /// </summary>
        public override async Task OnClosed()
        {
            this.NotifyPeerLost();
            Thread.Sleep(1000);
            //Update user
            var user = XSockets.Core.Utility.Storage.Repository<Guid, IPresence>.GetById(this.PersistentId);
            user.Online = false;
            SavePresence(user);
            await base.OnClosed();
        }

        private void NotifyPeerLost()
        {
            if (Peer == null) return;
            this.InvokeTo(f => f.Peer.Context == Peer.Context, Peer, Events.Peer.Lost);
        }

        #endregion

        #region Overrides from XSocketController

        #endregion

        #region Signaling Methods

        /// <summary>
        /// Distribute signals (SDP's)
        /// </summary>
        /// <param name="signalingModel"></param>
        public void ContextSignal(SignalingModel signalingModel)
        {
            this.InvokeTo<ConnectionBroker>(f => f.ConnectionId == signalingModel.Recipient, signalingModel, Events.Context.Signal);
        }

        public void ConnectToContext()
        {
            // Pass the client a list of Peers to Connect
            this.Invoke(this.GetConnections(this.Peer)
                       .Where(q => !q.Connections.Contains(this.Peer)).
                        Select(p => p.Peer).AsMessage(Events.Context.Connect));
        }

        /// <summary>
        /// Leave a context
        /// </summary>
        public void LeaveContext()
        {
            this.NotifyPeerLost();

            this.Peer.Context = new Guid();
            this.Invoke(Peer, Events.Context.Created);
        }

        public void OfferContext(string a)
        {
            //var p = new {Peer = this.Peer};
            var users =
                this.FindOn<ConnectionBroker>(
                    u => u.Peer.Context == this.Peer.Context && u.PersistentId != this.PersistentId);

            foreach (var user in users)
            {
                user.Invoke(this.Peer, Events.Context.Offer);
            }
        }

        /// <summary>
        ///    Current client changes context
        /// </summary>
        /// <param name="context"></param>
        public void ChangeContext(Guid context)
        {
            this.Peer.Context = context;
            this.NotifyContextChange(context, this.ConnectToContext);
        }


        public void SetContext(Guid context)
        {
            this.Peer.Context = context;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="recipient"></param>
        public void DisconnectPeer(Guid recipient)
        {
            this.PublishTo(p => p.ConnectionId == recipient, new { Sender = this.ConnectionId }, Events.Peer.Disconnect);
        }

        #endregion

        #region Stream Methods

        /// <summary>
        /// Notify PeerConnections on the current context that a MediaStream is removed.
        /// </summary>
        /// <param name="streamId"></param>
        public void RemoveStream(string streamId)
        {
            this.InvokeTo<ConnectionBroker>(f => f.Peer.Context == Peer.Context, new StreamModel { Sender = ConnectionId, StreamId = streamId }, Events.Stream.Remove);
        }

        /// <summary>
        /// Notify PeerConnections on the current context that a MediaStream is added.
        /// </summary>
        /// <param name="streamId"></param>
        /// <param name="description">JSON</param>
        public void AddStream(string streamId, string description)
        {
			var user = XSockets.Core.Utility.Storage.Repository<Guid, IPresence>.GetById(this.PersistentId);
			user.streamId = streamId;
			SavePresence(user);        

            this.InvokeTo<ConnectionBroker>(f => f.Peer.Context == Peer.Context,
                new StreamModel
                {
                    Sender = ConnectionId,
                    StreamId = streamId,
                    Description = description
                }, Events.Stream.Add);
        }        

        private IEnumerable<ConnectionBroker> GetConnections(IPeerConnection peerConnection)
        {
            return this.Find(f => f.Peer.Context == peerConnection.Context).Select(p => p).Except(new List<ConnectionBroker> { this });
        }

        private void NotifyContextChange(Guid context, Action callback)
        {
            this.InvokeTo<ConnectionBroker>(c => c.Peer.Context == context, this.Find(q => q.Peer.Context == context).Select(p => p.Peer), Events.Context.Changed);
            if (callback != null)
                callback();
        }
        #endregion

        #region Presence Methods

        public void SetUsername(string username)
        {
            var user = XSockets.Core.Utility.Storage.Repository<Guid, IPresence>.GetById(this.PersistentId);
            user.UserName = username;
            SavePresence(user);            
        }

        public void SetAvailability(Availability availability)
        {
            var user = XSockets.Core.Utility.Storage.Repository<Guid, IPresence>.GetById(this.PersistentId);
            user.Availability = availability;
            SavePresence(user);            
        }



		public async Task userInfo()
		{
			var users = XSockets.Core.Utility.Storage.Repository<Guid, IPresence>.Find(p => p.Context == this.ContextId);
			await this.InvokeToAll(users, "userupdate");
		}

		public async Task UpdateRemoteVideo(string message)
		{
			await this.InvokeToOthers(message, "updateremotevideo");
		}

        private void SavePresence(IPresence presence)
        {
            var user = XSockets.Core.Utility.Storage.Repository<Guid, IPresence>.AddOrUpdate(this.PersistentId, presence);
			var users = XSockets.Core.Utility.Storage.Repository<Guid, IPresence>.Find(p => p.Context == this.ContextId);
            //this.InvokeToOthers(user, "userupdate");
			this.InvokeToAll(users, "userupdate");
			//this.InvokeTo(p => p.GroupId == this.GroupId, user, "userupdate");
        }

		public async Task ActivateRecord(string command){
			if (command.Equals ("1")) {
				await this.InvokeTo(p => p.GroupId == this.GroupId, "record", "triggrrecord");
			}
			else if (command.Equals("0")){
				await this.InvokeTo(p => p.GroupId == this.GroupId, "stoprecord", "triggrrecord");
			}
		}

		public async Task ShareScreen(string command){			
			await this.InvokeTo(p => p.GroupId == this.GroupId, "1", "sharescreen");	
		}

		public async Task ReleaseShareScreen(string command){			
			await this.InvokeTo(p => p.GroupId == this.GroupId, "1", "releasesharescreen");
		}

		public async Task AddTagMessage(TagMessage message){
			_persistenceTagRecordModel.AddTagMessage (message);
		}

		// Get all "tagmessages"
		public async Task TagMessages()
		{
			var messages = _persistenceTagRecordModel.GetTagMessages(this.GroupId);
			await this.InvokeTo(p => p.GroupId == this.GroupId, messages, "tagMessages");
			//await this.InvokeToAll(messages, "tagMessages");

		}

		public async Task TagMessagesNumber()
		{
			var number = _persistenceTagRecordModel.GetTagMessages (this.GroupId).Count;
			await this.InvokeTo(p => p.GroupId == this.GroupId, number, "tagMessagesNumber");
		}

		public async Task FileShare(IMessage message)
		{
			await this.InvokeTo(p => p.GroupId == this.GroupId, message, "recordingreceived");
			//await this.InvokeToAll(message, "recordingreceived");
		}

        #endregion

        #region VoiceMessage Methods
        public Guid SaveVoiceMessage(IMessage message)
        {
            var voiceMessage = message.Extract<VoiceMessage>();
            voiceMessage.Sender = this.PersistentId;   // Mark this peer as sender
            voiceMessage.Bytes = message.Blob.ToArray();
            XSockets.Core.Utility.Storage.Repository<Guid, IVoiceMessage>.AddOrUpdate(voiceMessage.Id, voiceMessage);
            return voiceMessage.Id;
        }

        public void GetVoiceMessage(Guid id)
        {
            var voiceMessage = XSockets.Core.Utility.Storage.Repository<Guid, IVoiceMessage>.GetById(id);

            this.Invoke(voiceMessage.Bytes.ToArray(), new {voiceMessageId = voiceMessage.Id},"voicemessage");
        }
        public object CheckVoiceMessages()
        {
            var voiceMessages = XSockets.Core.Utility.Storage.Repository<Guid, IVoiceMessage>
                .Find(q => q.Recipient == this.PersistentId)
                .Select(m => new {m.Created, m.Id, m.Sender,Size = m.Bytes.Count()});
            return voiceMessages;
        } 
#endregion 

    }
}