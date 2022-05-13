using Microsoft.Extensions.Caching.Memory;

namespace Backend.Cache
{
    public class BouveteketMemoryCache
    {
        public MemoryCache Cache { get; set; }
        public BouveteketMemoryCache()
        {
            Cache = new MemoryCache(new MemoryCacheOptions
            {
                SizeLimit = 1024
            });
        }
    }
}