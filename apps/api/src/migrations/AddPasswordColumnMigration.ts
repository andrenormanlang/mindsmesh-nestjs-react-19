import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPasswordColumnMigration implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'password',
        type: 'varchar',
        isNullable: false,
        default: "'$2b$10$u...hashed-dummy-value'", // Replace this with a proper hashed value
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user', 'password');
  }
}
