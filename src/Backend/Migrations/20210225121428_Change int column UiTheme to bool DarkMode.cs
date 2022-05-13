using Microsoft.EntityFrameworkCore.Migrations;

namespace BouveteketBackend.Migrations
{
    public partial class ChangeintcolumnUiThemetoboolDarkMode : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UiTheme",
                table: "Users");

            migrationBuilder.AddColumn<bool>(
                name: "DarkMode",
                table: "Users",
                type: "bit",
                nullable: true,
                defaultValue: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DarkMode",
                table: "Users");

            migrationBuilder.AddColumn<int>(
                name: "UiTheme",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
