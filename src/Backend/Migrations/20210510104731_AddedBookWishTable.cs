using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace BouveteketBackend.Migrations
{
    public partial class AddedBookWishTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BookWishes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Authors = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Comment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Votes = table.Column<int>(type: "int", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookWishes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BookWishUser",
                columns: table => new
                {
                    BookWishesId = table.Column<int>(type: "int", nullable: false),
                    VotersId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookWishUser", x => new { x.BookWishesId, x.VotersId });
                    table.ForeignKey(
                        name: "FK_BookWishUser_BookWishes_BookWishesId",
                        column: x => x.BookWishesId,
                        principalTable: "BookWishes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BookWishUser_Users_VotersId",
                        column: x => x.VotersId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BookWishUser_VotersId",
                table: "BookWishUser",
                column: "VotersId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BookWishUser");

            migrationBuilder.DropTable(
                name: "BookWishes");
        }
    }
}
