import { Model, DataTypes, Sequelize, Association } from "sequelize";
import createLogger from "../../utils/Logger";

const log = createLogger(__filename);

export enum OTPUsed {
	yes = "1",
	no = "0",
}

export interface OTPAttributes {
	id?: number;
	otp?: string;
	otpId?: string;
	isUsed?: OTPUsed;
	expirationTime?: Date;
}

class OTP extends Model<OTPAttributes> implements OTPAttributes {
	public id?: number;
	public otp?: string;
	public otpId?: string;
	public status?: OTPUsed;

	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	static association(models: any) {}
}

const initModel = (sequelize: Sequelize): typeof OTP => {
	OTP.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
				set: (val) => {
					log("Cannot set id manually");
				},
			},
			otp: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			otpId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			isUsed: {
				type: DataTypes.ENUM(OTPUsed.yes, OTPUsed.no),
				allowNull: false,
				defaultValue: OTPUsed.no,
			},
			expirationTime: {
				type: DataTypes.DATE,
				allowNull: false,
			},
		},
		{ sequelize, modelName: "OTP", tableName: "OTPs", timestamps: true }
	);

	return OTP;
};

export default initModel;
