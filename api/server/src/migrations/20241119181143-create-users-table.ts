import { DataTypes, QueryInterface } from "sequelize";
import createLogger from "../../utils/Logger";

const log = createLogger(__filename);

export default {
	up: async (queryInterface: QueryInterface) => {
		await queryInterface.createTable("Users", {
			id: {
				type: DataTypes.BIGINT,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
				unique: true,
			},
			firstName: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			lastName: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			username: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			bvn: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			accountNumber: {
				type: DataTypes.STRING,
				allowNull: true,
				unique: true,
			},
			createdAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			updatedAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
		});
	},

	down: async (queryInterface: QueryInterface) => {
		await queryInterface.dropTable("Users");
	},
};
