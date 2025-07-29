/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('translations', function (table) {
    table.increments('id').primary();
    table.string('key').notNullable().unique();
    table.text('en').notNullable();
    table.text('ar').notNullable();
    table.string('category').defaultTo('general');
    table.text('description');
    table.timestamps(true, true);
    
    table.index('key');
    table.index('category');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('translations');
};