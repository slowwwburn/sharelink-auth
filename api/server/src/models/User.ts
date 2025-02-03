import { Model, DataTypes, Sequelize } from "sequelize";
import createLogger from "../../utils/Logger";
import Util from "../../utils/Util";

const log = createLogger(__filename);
const util = new Util();

export interface UserAttributes {
	id?: number;
	firstName?: string;
	lastName?: string;
	username?: string;
	password?: string;
	phonenumber?: string;
	email?: string;
	image?: string;
	bvn?: string;
	accountNumber?: string;
	bankCode?: string;
	initials?: string;
	color?: string;
	security?: boolean;
	paystackId?: string;
	paystackStatus?: string;
}

class User extends Model<UserAttributes> implements UserAttributes {
	public id?: number;
	public firstName?: string;
	public lastName?: string;
	public username?: string;
	public password?: string;
	public phonenumber?: string;
	public email?: string;
	public image?: string;
	public bvn?: string;
	public accountNumber?: string;
	public bankCode?: string;
	public initials?: string;
	public color?: string;
	public security?: boolean;
	public paystackId?: string;
	public paystackStatus?: string;

	// Timestamps (automatically handled by Sequelize if enabled)
	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	// Define associations
	static associate(models: any) {}
}

const initModel = (sequelize: Sequelize): typeof User => {
	User.init(
		{
			id: {
				type: DataTypes.BIGINT,
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
				allowNull: true,
				unique: true,
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			phonenumber: {
				type: DataTypes.STRING,
				unique: true,
				allowNull: false,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			image: {
				type: DataTypes.STRING,
				allowNull: true,
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
			bankCode: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			initials: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			color: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			security: {
				type: DataTypes.BOOLEAN,
				allowNull: true,
			},
			paystackId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			paystackStatus: {
				type: DataTypes.STRING,
				allowNull: true,
			},
		},
		{
			sequelize,
			modelName: "User",
			tableName: "Users",
			timestamps: true, // Enable createdAt and updatedAt
			hooks: {
				beforeCreate: (user) => {
					log("BeforeCreate hook triggered");
					try {
						user.id = util.generatePrimaryKey();
					} catch (err: any) {
						log("Error generating primary key: ", err.message);
						throw err;
					}
				},
			},
		}
	);

	return User;
};

export default initModel;
