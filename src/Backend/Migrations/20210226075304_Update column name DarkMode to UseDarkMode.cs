using Microsoft.EntityFrameworkCore.Migrations;

namespace BouveteketBackend.Migrations
{
    public partial class UpdatecolumnnameDarkModetoUseDarkMode : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DarkMode",
                table: "Users",
                newName: "UseDarkMode");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UseDarkMode",
                table: "Users",
                newName: "DarkMode");
        }
    }
}
