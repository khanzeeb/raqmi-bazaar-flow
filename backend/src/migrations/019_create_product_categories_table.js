exports.up = function(knex) {
  return knex.schema.createTable('product_categories', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable().unique();
    table.string('slug').notNullable().unique();
    table.text('description');
    table.string('image');
    table.uuid('parent_id').references('id').inTable('product_categories').onDelete('SET NULL');
    table.integer('sort_order').defaultTo(0);
    table.enu('status', ['active', 'inactive']).defaultTo('active');
    table.json('meta_data');
    table.timestamps(true, true);
    
    table.index(['parent_id']);
    table.index(['status']);
    table.index(['sort_order']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('product_categories');
};