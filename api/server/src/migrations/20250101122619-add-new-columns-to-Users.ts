import { DataTypes, QueryInterface } from "sequelize";

export default {
	up: async (queryInterface: QueryInterface) => {
		await queryInterface.addColumn("Users", "phonenumber", {
			type: DataTypes.STRING,
			allowNull: true,
		});

		await queryInterface.addColumn("Users", "bankCode", {
			type: DataTypes.STRING,
			allowNull: true,
		});
		await queryInterface.addColumn("Users", "paystackId", {
			type: DataTypes.STRING,
			allowNull: true,
		});
		await queryInterface.addColumn("Users", "paystackStatus", {
			type: DataTypes.STRING,
			allowNull: true,
		});
	},

	down: async (queryInterface: QueryInterface) => {
		await queryInterface.removeColumn("Users", "phonenumber");
		await queryInterface.removeColumn("Users", "bankCode");
		await queryInterface.removeColumn("Users", "paystackId");
		await queryInterface.removeColumn("Users", "paystackStatus");
	},
};
