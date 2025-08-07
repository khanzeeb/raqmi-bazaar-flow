exports.up = function(knex) {
  return knex.schema.createTable('suppliers', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('contact_person');
    table.string('email');
    table.string('phone');
    table.text('address');
    table.string('city');
    table.string('state');
    table.string('postal_code');
    table.string('country').notNullable().defaultTo('US');
    table.string('tax_id');
    table.enum('status', ['active', 'inactive']).notNullable().defaultTo('active');
    table.decimal('credit_limit', 12, 2).notNullable().defaultTo(0);
    table.text('notes');
    table.timestamps(true, true);
    
    table.index(['name']);
    table.index(['email']);
    table.index(['status']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('suppliers');
};