import { DataTypes, QueryInterface } from "sequelize";

export default {
	up: async (queryInterface: QueryInterface) => {
		await queryInterface.addColumn("Users", "initials", {
			type: DataTypes.STRING,
			allowNull: true,
		});

		await queryInterface.addColumn("Users", "color", {
			type: DataTypes.STRING,
			allowNull: true,
		});
		await queryInterface.addColumn("Users", "security", {
			type: DataTypes.BOOLEAN,
			allowNull: true,
		});
		await queryInterface.addColumn("Users", "image", {
			type: DataTypes.STRING,
			allowNull: true,
		});
	},

	down: async (queryInterface: QueryInterface) => {
		await queryInterface.removeColumn("Users", "initials");
		await queryInterface.removeColumn("Users", "color");
		await queryInterface.removeColumn("Users", "security");
		await queryInterface.removeColumn("Users", "image");
	},
};
