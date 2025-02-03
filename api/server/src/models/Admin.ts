import { Model, DataTypes, Sequelize } from "sequelize";
import createLogger from "../../utils/Logger";
import Util from "../../utils/Util";

const util = new Util();
const log = createLogger(__filename);

export interface AdminAttributes {
	id?: number;
	firstName?: string;
	lastName?: string;
	username?: string;
	password?: string;
	email?: string;
}

class Admin extends Model<AdminAttributes> implements AdminAttributes {
	public id?: number;
	public firstName?: string;
	public lastName?: string;
	public username?: string;
	public password?: string;
	public email?: string;

	// Timestamps (automatically handled by Sequelize if enabled)
	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	// Define associations
	static associate(models: any) {
		// Example: Gift.hasMany(models.Loan);
	}
}

const initModel = (sequelize: Sequelize): typeof Admin => {
	Admin.init(
		{
			id: {
				type: DataTypes.BIGINT,
				autoIncrement: true,
				primaryKey: true,
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
		},
		{
			sequelize,
			modelName: "Admin",
			tableName: "Admins",
			timestamps: true, // Enable createdAt and updatedAt
		}
	);

	Admin.beforeCreate((admin) => {
		admin.id = util.generatePrimaryKey();
	});

	return Admin;
};

export default initModel;
