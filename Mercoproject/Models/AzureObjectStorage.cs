using System;
using System.Threading.Tasks;
using XSockets.Core.XSocket;


public class AzureObjectStorage : PersistentObjectStorage
{
    public override async Task Set<T>(T controller, string key, object value)
    {
        await new StorageObject(controller.Alias, key, value).SaveEntity();
    }

    public override async Task<object> Get<T>(T controller, string key)
    {
        var e = new StorageObject(controller.Alias, key);
        var so = await e.GetEntity();
        return so.Deserialize();
    }

    public override async Task Remove<T>(T controller, string key)
    {
        var e = new StorageObject(controller.Alias, key);
        await e.DeleteEntity();
    }

    public override Task Clear<T>(T controller)
    {
        //No implementation of clear....
        throw new NotImplementedException();
    }
}