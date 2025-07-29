exports.up = function(knex) {
  return knex.schema.createTable('products', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('sku').unique().notNullable();
    table.string('category').notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.decimal('cost', 10, 2).notNullable();
    table.integer('stock').defaultTo(0);
    table.integer('min_stock').defaultTo(0);
    table.integer('max_stock').defaultTo(1000);
    table.string('image');
    table.text('description');
    table.string('short_description');
    table.enu('status', ['active', 'inactive', 'discontinued']).defaultTo('active');
    table.string('supplier');
    table.string('barcode');
    table.decimal('weight', 8, 2);
    table.json('dimensions');
    table.json('tags');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('products');
};