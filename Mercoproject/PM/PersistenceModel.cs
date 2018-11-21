using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mercoproject.Models;

namespace Mercoproject.PM
{
    public class PersistenceModel : OrigoDB.Core.Model
    {
        public PersistenceModel()
        {
           
            this.ChatMessages = new List<ChatMessage>();
			this.PeerModels = new List<FakePeerModel>();
        }

        private List<ChatMessage> ChatMessages { get; set; }

		private List<FakePeerModel> PeerModels { get; set; }

        public List<ChatMessage> GetChatMessages(Guid context)
        {
            return this.ChatMessages.Where(p => p.Context == context).ToList();
        }

        public void AddChatMessage(ChatMessage chatMessage)
        {
            this.ChatMessages.Add(chatMessage);
        }

		public void AddPeerModel(FakePeerModel peermodel){
							
			//UserModel result = this.PeerModels.Find(item => item.Id == usermodel.Id);
			//if (result != null) 
			//{
			//	result.UserName = usermodel.UserName;
			//	result.GroupName = usermodel.GroupName;
			//
			//	if (usermodel.VideoId != Guid.Empty)
			//	{
			//		result.VideoId = usermodel.VideoId;
			//	}
			//} else 
			//{
			this.PeerModels.Add (peermodel);
			//}
			
		}

		public void UpdatePeerModel(FakePeerModel peermodel)
		{
			FakePeerModel result = this.PeerModels.Find(item => item.Id == peermodel.Id);
			if (result != null) 
			{
				result.UserName = peermodel.UserName;
				result.GroupName = peermodel.GroupName;
			} 		
		}
			
		public List<FakePeerModel> GetPeerModels(Guid context)
		{
			return this.PeerModels.Where(p => p.Context == context).ToList();
		}
    }

}
