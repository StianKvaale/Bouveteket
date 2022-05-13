using System;
using System.IO;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Backend.Models;
using Backend.Services.Interfaces;
using Microsoft.Extensions.Options;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;

namespace Backend.Services
{
    public class BlobStorageService : IBlobStorageService
    {
        private readonly AzureStorageConfig _storageConfig;

        public BlobStorageService(IOptions<AzureStorageConfig> storageConfig)
        {
            _storageConfig = storageConfig != null ? storageConfig.Value : throw new ArgumentNullException(nameof(storageConfig));
        }

        public async Task<string> UploadImageToBlobIfBase64(string imageString, string newFileName)
        {
            byte[] imageAsBytes;
            try
            {
                if (imageString.StartsWith("data"))
                {
                    imageString = imageString.Split(",")[1];
                }
                imageAsBytes = Convert.FromBase64String(imageString);
            } catch (Exception)
            {
                return string.Empty;
            }

            var blobContainer = new BlobContainerClient(_storageConfig.BlobConnectionString, _storageConfig.ImageContainer);
            var uniqueFileName = $"{newFileName}_{Guid.NewGuid()}.jpg";
            var blobClient = blobContainer.GetBlobClient(uniqueFileName);

            using (var resizedImage = new MemoryStream())
            {
                using (var image = Image.Load(imageAsBytes))
                {
                    var resizedHeight = Math.Min(300, image.Height);
                    var divisor = image.Height / resizedHeight;
                    var resizedWidth = Convert.ToInt32(Math.Round((decimal)(image.Width / divisor)));

                    image.Mutate(x => x.Resize(resizedWidth, resizedHeight));
                    image.Save(resizedImage, new JpegEncoder());
                    resizedImage.Position = 0;
                }
                await blobClient.UploadAsync(resizedImage);
            }

            return blobClient.Uri.ToString();
        }
    }
}
