using Microsoft.EntityFrameworkCore.Migrations;

namespace BouveteketBackend.Migrations
{
    public partial class Googleratingchanges : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<float>(
                name: "GoogleRating",
                table: "Books",
                type: "real",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GoogleRatingCount",
                table: "Books",
                type: "int",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GoogleRating",
                table: "Books");

            migrationBuilder.DropColumn(
                name: "GoogleRatingCount",
                table: "Books");
        }
    }
}
