using System.Collections.Generic;

namespace Backend.Models
{
    public class Validation
    {
        public bool Error { get; set; }
        public List<string> ErrorMessages { get; set; }
    }
}