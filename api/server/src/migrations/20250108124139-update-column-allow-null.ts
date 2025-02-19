import { DataTypes, QueryInterface } from "sequelize";

export default {
	up: async (queryInterface: QueryInterface) => {
		await queryInterface.changeColumn("Users", "username", {
			type: DataTypes.STRING,
			allowNull: true,
		});
	},

	down: async (queryInterface: QueryInterface) => {
		await queryInterface.changeColumn("Users", "username", {
			type: DataTypes.STRING,
			allowNull: true,
		});
	},
};
