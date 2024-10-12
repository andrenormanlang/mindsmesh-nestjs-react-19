import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsEmailVerifiedColumn1728728247472 implements MigrationInterface {
    name = 'AddIsEmailVerifiedColumn1728728247472'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "isEmailVerified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user" ADD "emailVerificationToken" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "emailVerificationToken"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isEmailVerified"`);
    }

}
