using System.IO;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace Backend.Utilities
{
    public class DgmlFactory
    {
        private readonly BouveteketContext _context;
        private readonly string _defaultPath = Directory.GetCurrentDirectory() + "\\Dgml";

        public DgmlFactory(BouveteketContext context)
        {
            _context = context;            
        }

        public bool CreateDefaultDGML()
        {
            if (_context == null)
            {
                return false;
            }

            File.WriteAllText(_defaultPath + "\\Entities.dgml", _context.AsDgml(), Encoding.UTF8);
            return true;
        }

        public bool CreateDGML(string path, string fileName = "Entities")
        {
            if (_context == null || string.IsNullOrWhiteSpace(path) || string.IsNullOrWhiteSpace(fileName))
            {
                return false;
            }
            File.WriteAllText(path + $"\\{fileName}.dgml", _context.AsDgml(), Encoding.UTF8);
            return true;
        }
    }
}
