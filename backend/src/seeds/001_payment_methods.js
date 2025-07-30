exports.seed = async function(knex) {
  // Clear existing entries
  await knex('payment_methods').del();
  
  // Insert default payment methods
  await knex('payment_methods').insert([
    {
      id: 1,
      name: 'Cash',
      code: 'cash',
      description: 'Cash payment',
      is_active: true,
      requires_reference: false,
      requires_approval: false,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 2,
      name: 'Bank Transfer',
      code: 'bank_transfer',
      description: 'Bank transfer payment',
      is_active: true,
      requires_reference: true,
      requires_approval: false,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 3,
      name: 'Credit',
      code: 'credit',
      description: 'Credit payment',
      is_active: true,
      requires_reference: false,
      requires_approval: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    },
    {
      id: 4,
      name: 'Check',
      code: 'check',
      description: 'Check payment',
      is_active: true,
      requires_reference: true,
      requires_approval: true,
      validation_rules: JSON.stringify({
        requires_image: true,
        check_number_required: true
      }),
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    }
  ]);
};