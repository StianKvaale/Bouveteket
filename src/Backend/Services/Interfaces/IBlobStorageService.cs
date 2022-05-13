using System.Threading.Tasks;

namespace Backend.Services.Interfaces
{
    public interface IBlobStorageService
    {
        Task<string> UploadImageToBlobIfBase64(string base64Image, string newFileName);
    }
}
