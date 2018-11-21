using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mercoproject.Models;

namespace Mercoproject.PM
{
	public class PersistenceTagRecordModel : OrigoDB.Core.Model
	{
		public PersistenceTagRecordModel()
		{
			this.TagMessages = new List<TagMessage>();
		}

		private List<TagMessage> TagMessages { get; set; }

		public List<TagMessage> GetTagMessages(Guid groupId)
		{
			return this.TagMessages.Where(p => p.GroupId == groupId).ToList();
		}

		public void AddTagMessage(TagMessage tagMessage)
		{
			this.TagMessages.Add(tagMessage);
		}
	}

}
