"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = __importDefault(require("../../util/Logger"));
const log = (0, Logger_1.default)(__filename);
const proc = "coll4rmgift";
const query = `BEGIN
    -- Get gift using Id
    SELECT id, size, "sizeCount" INTO giftId, giftSize, giftSizeCount
    FROM "Gifts" 
    WHERE code = giftCode
    FOR UPDATE;
    
    IF NOT FOUND THEN
      result := FALSE;
      message := 'Gift not found';
      RETURN;
    ELSE
      result := TRUE;
      message := 'Gift found';
    END IF;

    -- Insert Collections when sizeCount < size
    IF giftSizeCount < giftSize THEN
      INSERT INTO "Collections" (type, "userId", "giftId", "transId", status, "createdAt", "updatedAt")
      VALUES (collectionType::"enum_Collections_type", userId, giftId, null, 'PENDING'::"enum_Collections_status", NOW(), NOW());

      -- Update Collections table
      UPDATE "Gifts"
      SET "sizeCount" = giftSizeCount + 1
      WHERE id = giftId;

      IF NOT FOUND THEN
        result := TRUE;
        message := 'Collections added but no gift updated.';
      ELSE
        result := TRUE;
        message := 'Collection and gift update successful.';
        COMMIT;
      END IF;
    ELSE
      result := FALSE;
      message := 'Gift size limit reached, cannot add collection.';
    END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error occurred: %', SQLERRM;
      ROLLBACK;
      result := FALSE;
      message := SQLERRM;
      RETURN;
  END;`;
module.exports = {
    up(queryInterface) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryInterface.sequelize.query(`
      CREATE OR REPLACE PROCEDURE ${proc}(
        giftCode VARCHAR,
        userId INTEGER,
        collectionType "enum_Collections_type",
        OUT result BOOLEAN,
        OUT message TEXT)
      LANGUAGE plpgsql
      AS $$
      DECLARE
        giftId INTEGER; 
        giftSize INTEGER;
        giftSizeCount INTEGER;
        BEGIN
          ${query}
        END
      $$;
    `);
        });
    },
    down(queryInterface) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryInterface.sequelize.query(`
      DROP PROCEDURE IF EXISTS ${proc};`);
        });
    },
};
